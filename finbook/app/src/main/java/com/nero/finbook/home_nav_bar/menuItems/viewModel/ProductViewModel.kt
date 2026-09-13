/*
 * Copyright (c) 2026 Finbook. All rights reserved.
 */
package com.nero.finbook.home_nav_bar.menuItems.viewModel

import androidx.lifecycle.LiveData
import androidx.lifecycle.ViewModel
import com.nero.finbook.local.entity.ExpenseEntity
import com.nero.finbook.local.entity.ItemsEntity
import com.nero.finbook.repository.ItemsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class ProductViewModel @Inject constructor(private val itemsRepository: ItemsRepository) :
    ViewModel() {

    fun getItems(): LiveData<List<ItemsEntity>> {
        return itemsRepository.getAllItems()
    }
}