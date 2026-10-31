package com.jarvis.assistant.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jarvis.assistant.data.db.MemoryEntity
import com.jarvis.assistant.ui.theme.*
import com.jarvis.assistant.viewmodel.AssistantViewModel

/**
 * JARVIS Local Memory Vault.
 * Powered by Android Room Database.
 * Allows viewing, adding, deleting individual memories, and clearing all memories.
 */
@Composable
fun MemoryScreen(viewModel: AssistantViewModel) {
    val memories by viewModel.memories.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }
    var newMemoryContent by remember { mutableStateOf("") }
    var newMemoryCategory by remember { mutableStateOf("PREFERENCE") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(JarvisDeepBlack)
            .padding(16.dp)
    ) {
        // Vault Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Psychology,
                        contentDescription = null,
                        tint = JarvisCyanPrimary,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "MEMORY VAULT",
                        color = JarvisCyanPrimary,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                }
                Text(
                    text = "${memories.size} Active Local Memories",
                    color = JarvisTextSecondary,
                    fontSize = 12.sp
                )
            }

            Row {
                IconButton(onClick = { viewModel.clearAllMemories() }) {
                    Icon(
                        imageVector = Icons.Default.DeleteSweep,
                        contentDescription = "Clear all",
                        tint = JarvisDanger
                    )
                }

                IconButton(onClick = { showAddDialog = true }) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Add memory",
                        tint = JarvisCyanPrimary
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (memories.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No memories stored yet.\nJARVIS will record user-approved notes and preferences here.",
                    color = JarvisTextDim,
                    fontSize = 13.sp,
                    lineHeight = 18.sp
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(memories, key = { it.id }) { memory ->
                    MemoryCard(
                        memory = memory,
                        onDelete = { viewModel.deleteMemory(memory) }
                    )
                }
            }
        }
    }

    if (showAddDialog) {
        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = {
                Text("Store in JARVIS Memory", color = JarvisCyanPrimary, fontSize = 16.sp)
            },
            text = {
                Column {
                    OutlinedTextField(
                        value = newMemoryContent,
                        onValueChange = { newMemoryContent = it },
                        label = { Text("Information / Preference") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newMemoryContent.isNotBlank()) {
                            viewModel.saveMemory(newMemoryCategory, newMemoryContent.trim())
                            newMemoryContent = ""
                            showAddDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = JarvisCyanPrimary)
                ) {
                    Text("Store", color = JarvisDeepBlack)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) {
                    Text("Cancel", color = JarvisTextSecondary)
                }
            },
            containerColor = JarvisDeepNavy
        )
    }
}

@Composable
fun MemoryCard(memory: MemoryEntity, onDelete: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(JarvisDeepNavy)
            .border(1.dp, JarvisBorder, RoundedCornerShape(12.dp))
            .padding(14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = memory.category.uppercase(),
                color = JarvisCyanElectric,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = memory.content,
                color = JarvisTextPrimary,
                fontSize = 13.sp,
                lineHeight = 18.sp
            )
        }

        IconButton(onClick = onDelete) {
            Icon(
                imageVector = Icons.Default.Delete,
                contentDescription = "Delete",
                tint = JarvisTextDim
            )
        }
    }
}
