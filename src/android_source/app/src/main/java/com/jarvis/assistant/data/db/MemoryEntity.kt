package com.jarvis.assistant.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entity representing a user-approved piece of JARVIS memory.
 * Can store user preferences, custom instructions, important notes,
 * or conversation summaries.
 */
@Entity(tableName = "jarvis_memories")
data class MemoryEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val category: String, // "PREFERENCE", "NOTE", "INSTRUCTION", "SUMMARY"
    val content: String,
    val timestamp: Long = System.currentTimeMillis(),
    val isSensitive: Boolean = false
)
