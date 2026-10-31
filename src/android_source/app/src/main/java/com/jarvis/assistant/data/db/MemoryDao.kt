package com.jarvis.assistant.data.db

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object for JARVIS Room memory system.
 * Emits reactive StateFlow/Flow updates to the ViewModel.
 */
@Dao
interface MemoryDao {

    @Query("SELECT * FROM jarvis_memories ORDER BY timestamp DESC")
    fun getAllMemories(): Flow<List<MemoryEntity>>

    @Query("SELECT * FROM jarvis_memories WHERE category = :category ORDER BY timestamp DESC")
    fun getMemoriesByCategory(category: String): Flow<List<MemoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMemory(memory: MemoryEntity): Long

    @Delete
    suspend fun deleteMemory(memory: MemoryEntity)

    @Query("DELETE FROM jarvis_memories WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("DELETE FROM jarvis_memories")
    suspend fun clearAllMemories()

    @Query("SELECT COUNT(*) FROM jarvis_memories")
    suspend fun getCount(): Int
}
