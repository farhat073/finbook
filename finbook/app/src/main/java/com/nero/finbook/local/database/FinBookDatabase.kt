/*
 * Copyright (c) 2026 Finbook. All rights reserved.
 */
package com.nero.finbook.local.database

import androidx.room.Database
import androidx.room.RoomDatabase
import com.nero.finbook.local.dao.FinBookDAO
import com.nero.finbook.local.entity.ExpenseEntity
import com.nero.finbook.local.entity.ItemsEntity
import com.nero.finbook.local.entity.PartyEntity
import com.nero.finbook.local.entity.TransactionEntity

@Database(
    entities = [ItemsEntity::class, PartyEntity::class, TransactionEntity::class, ExpenseEntity::class],
    version = 1
)
abstract class FinBookDatabase : RoomDatabase() {
    abstract fun getDAO(): FinBookDAO
}