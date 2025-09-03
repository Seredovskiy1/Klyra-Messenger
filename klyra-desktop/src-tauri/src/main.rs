// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock, mpsc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ChatMessage {
    id: String,
    text: String,
    sender: String,
    timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct User {
    id: String,
    name: String,
    nickname: String,
    status: String,
}

type Users = Arc<RwLock<HashMap<String, User>>>;
type Messages = Arc<Mutex<Vec<ChatMessage>>>;
type Connections = Arc<RwLock<HashMap<String, mpsc::UnboundedSender<serde_json::Value>>>>;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn start_chat_server(port: u16, server_name: String) -> Result<String, String> {
    let users: Users = Arc::new(RwLock::new(HashMap::new()));
    let messages: Messages = Arc::new(Mutex::new(Vec::new()));
    let connections: Connections = Arc::new(RwLock::new(HashMap::new()));
    
    // Start WebSocket server in background
    let users_clone = users.clone();
    let messages_clone = messages.clone();
    let connections_clone = connections.clone();
    
    tokio::spawn(async move {
        if let Err(e) = run_websocket_server(port, server_name, users_clone, messages_clone, connections_clone).await {
            // WebSocket server error (no logging for anonymity)
        }
    });
    
    Ok(format!("Chat server started on port {}", port))
}

async fn run_websocket_server(
    port: u16,
    server_name: String,
    users: Users,
    messages: Messages,
    connections: Connections,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    use tokio::net::TcpListener;
    use tokio_tungstenite::{accept_async, tungstenite::Message};
    use futures_util::{SinkExt, StreamExt};

    
    let addr = format!("127.0.0.1:{}", port);
    let listener = TcpListener::bind(&addr).await?;
    
    // Server started (no logging for anonymity)
    
    while let Ok((stream, _)) = listener.accept().await {
        // New connection (no IP tracking for anonymity)
        
        let ws_stream = accept_async(stream).await?;
        let (ws_sender, ws_receiver) = ws_stream.split();
        
        // Clone shared data for this connection
        let users_clone = users.clone();
        let messages_clone = messages.clone();
        let connections_clone = connections.clone();
        let server_name_clone = server_name.clone();
        
        // Create a channel for this connection
        let (tx, mut rx) = mpsc::unbounded_channel::<serde_json::Value>();
        let connection_id = Uuid::new_v4().to_string();
        
        // Store the connection
        {
            let mut connections_guard = connections_clone.write().await;
            connections_guard.insert(connection_id.clone(), tx);
        }
        
        // Spawn a task for this connection
        tokio::spawn(async move {
            let (mut ws_sender, mut ws_receiver) = (ws_sender, ws_receiver);
            
            // Send welcome message directly to this client only (not through broadcast)
            let welcome_msg = serde_json::json!({
                "type": "system",
                "text": format!("Welcome to {}!", server_name_clone),
                "timestamp": std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_secs()
            });
            
            // Sending welcome message (no logging for anonymity)
            
            // Send directly to this client only
            if let Err(e) = ws_sender.send(Message::Text(welcome_msg.to_string())).await {
                // Failed to send welcome message (no logging for anonymity)
                return;
            }
            
            // Spawn a task to handle outgoing messages
            tokio::spawn(async move {
                while let Some(msg) = rx.recv().await {
                    if let Err(e) = ws_sender.send(Message::Text(msg.to_string())).await {
                        // Failed to send message (no logging for anonymity)
                        break;
                    }
                }
            });
            
            // Handle incoming messages
            while let Some(msg) = ws_receiver.next().await {
                match msg {
                    Ok(Message::Text(text)) => {
                        if let Ok(data) = serde_json::from_str::<serde_json::Value>(&text) {
                            handle_client_message(data, &connection_id, &users_clone, &messages_clone, &connections_clone).await;
                        }
                    }
                    Ok(Message::Close(_)) => {
                        // Connection closed (no logging for anonymity)
                        // Remove connection from the list and notify other users
                        {
                            let mut connections_guard = connections_clone.write().await;
                            connections_guard.remove(&connection_id);
                        }
                        
                        // Notify other users about disconnection
                        let leave_msg = serde_json::json!({
                            "type": "system",
                            "text": "A user left the chat",
                            "timestamp": std::time::SystemTime::now()
                                .duration_since(std::time::UNIX_EPOCH)
                                .unwrap()
                                .as_secs()
                        });
                        broadcast_message(&leave_msg, &connections_clone).await;
                        break;
                    }
                    Err(e) => {
                        // WebSocket error (no logging for anonymity)
                        // Remove connection from the list
                        {
                            let mut connections_guard = connections_clone.write().await;
                            connections_guard.remove(&connection_id);
                        }
                        break;
                    }
                    _ => {}
                }
            }
        });
    }
    
    Ok(())
}

async fn handle_client_message(
    data: serde_json::Value,
    _connection_id: &str,
    users: &Users,
    messages: &Messages,
    connections: &Connections,
) {
    if let Some(msg_type) = data.get("type").and_then(|v| v.as_str()) {
        match msg_type {
            "user_join" => {
                if let Some(user_data) = data.get("user") {
                    if let Ok(user) = serde_json::from_value::<User>(user_data.clone()) {
                        // Add user to the list
                        let mut users_guard = users.write().await;
                        users_guard.insert(user.id.clone(), user.clone());
                        
                        // Broadcast user join message to all clients
                        let join_msg = serde_json::json!({
                            "type": "system",
                            "text": format!("{} joined the chat", user.name),
                            "timestamp": std::time::SystemTime::now()
                                .duration_since(std::time::UNIX_EPOCH)
                                .unwrap()
                                .as_secs()
                        });
                        
                        broadcast_message(&join_msg, connections).await;
                    }
                }
            }
            "message" => {
                if let (Some(text), Some(sender)) = (data.get("text").and_then(|v| v.as_str()), data.get("sender").and_then(|v| v.as_str())) {
                    // Create message
                    let chat_message = ChatMessage {
                        id: Uuid::new_v4().to_string(),
                        text: text.to_string(),
                        sender: sender.to_string(),
                        timestamp: std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap()
                            .as_secs(),
                    };
                    
                    // Broadcast message to all clients (no storage for anonymity)
                    let is_encrypted = data.get("encrypted").and_then(|v| v.as_bool()).unwrap_or(false);
                    let broadcast_msg = serde_json::json!({
                        "type": "message",
                        "text": chat_message.text,
                        "sender": chat_message.sender,
                        "timestamp": chat_message.timestamp,
                        "encrypted": is_encrypted
                    });
                    
                    broadcast_message(&broadcast_msg, connections).await;
                }
            }
            "file" => {
                if let (Some(file_data), Some(sender)) = (
                    data.get("fileData").and_then(|v| v.as_str()),
                    data.get("sender").and_then(|v| v.as_str())
                ) {
                    // Broadcast file to all clients (no metadata for anonymity)
                    let broadcast_msg = serde_json::json!({
                        "type": "file",
                        "fileData": file_data,
                        "sender": sender,
                        "timestamp": std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap()
                            .as_secs()
                    });
                    
                    broadcast_message(&broadcast_msg, connections).await;
                }
            }
            "edit_message" => {
                if let (Some(message_id), Some(new_text), Some(sender)) = (
                    data.get("messageId").and_then(|v| v.as_str()),
                    data.get("newText").and_then(|v| v.as_str()),
                    data.get("sender").and_then(|v| v.as_str())
                ) {
                    // Broadcast edit to all clients (no storage for anonymity)
                    let is_encrypted = data.get("encrypted").and_then(|v| v.as_bool()).unwrap_or(false);
                    let broadcast_msg = serde_json::json!({
                        "type": "message_edited",
                        "messageId": message_id,
                        "newText": new_text,
                        "sender": sender,
                        "timestamp": std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap()
                            .as_secs(),
                        "encrypted": is_encrypted
                    });
                    
                    broadcast_message(&broadcast_msg, connections).await;
                }
            }
            "delete_message" => {
                if let (Some(message_id), Some(sender)) = (
                    data.get("messageId").and_then(|v| v.as_str()),
                    data.get("sender").and_then(|v| v.as_str())
                ) {
                    // Broadcast deletion to all clients (no storage for anonymity)
                    let broadcast_msg = serde_json::json!({
                        "type": "message_deleted",
                        "messageId": message_id,
                        "sender": sender,
                        "timestamp": std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap()
                            .as_secs()
                    });
                    
                    broadcast_message(&broadcast_msg, connections).await;
                }
            }

            _ => {
                // Unknown message type (no logging for anonymity)
            }
        }
    }
}

async fn broadcast_message(message: &serde_json::Value, connections: &Connections) {
    let connections_guard = connections.read().await;
    let mut failed_connections = Vec::new();
    
    // Broadcasting message (no logging for anonymity)
    
    for (connection_id, sender) in connections_guard.iter() {
        if let Err(_) = sender.send(message.clone()) {
            failed_connections.push(connection_id.clone());
        }
    }
    
    // Remove failed connections
    if !failed_connections.is_empty() {
        drop(connections_guard);
        let mut connections_guard = connections.write().await;
        for connection_id in failed_connections {
            connections_guard.remove(&connection_id);
            // Removed failed connection (no logging for anonymity)
        }
    }
}



fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, start_chat_server])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
