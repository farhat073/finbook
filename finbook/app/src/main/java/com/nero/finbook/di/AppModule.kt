/*
 * Copyright (c) 2026 Finbook. All rights reserved.
 */
package com.nero.finbook.di

import android.app.Application
import androidx.room.Room
import com.nero.finbook.local.database.FinBookDatabase
import com.nero.finbook.repository.ItemsRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Inject
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
class AppModule {

    @Provides
    @Singleton
    fun provideDataBase(
        app: Application
    ): FinBookDatabase {
        return Room.databaseBuilder(app, FinBookDatabase::class.java, "FinBookDatabase")
            .fallbackToDestructiveMigration().build()
    }


    @Provides
    @Singleton
    fun provideItemRepository(
        database: FinBookDatabase
    ): ItemsRepository {
        return ItemsRepository(database.getDAO())
    }

}