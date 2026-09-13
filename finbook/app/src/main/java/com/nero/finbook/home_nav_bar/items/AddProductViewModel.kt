/*
 * Copyright (c) 2026 Finbook. All rights reserved.
 */
package com.nero.finbook.home_nav_bar.items

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nero.finbook.local.entity.ItemsEntity
import com.nero.finbook.repository.ItemsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel

class AddProductViewModel @Inject constructor(
    private val repository: ItemsRepository
) : ViewModel() {

    fun addItem(itemsEntity: ItemsEntity) {
        viewModelScope.launch {
            repository.addItem(itemsEntity)
        }
    }


    fun updateItem(itemsEntity: ItemsEntity) {
        viewModelScope.launch {
            repository.updateItem(itemsEntity)
        }
    }


}