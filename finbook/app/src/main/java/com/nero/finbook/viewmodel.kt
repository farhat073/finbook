/*
 * Copyright (c) 2026 Finbook. All rights reserved.
 */
package com.nero.finbook

import androidx.lifecycle.ViewModel
import com.nero.finbook.local.database.FinBookDatabase
import com.nero.finbook.repository.ItemsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class viewmodel @Inject constructor(
    database: ItemsRepository
) : ViewModel() {



}