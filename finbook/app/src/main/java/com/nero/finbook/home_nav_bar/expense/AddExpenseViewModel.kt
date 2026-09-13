/*
 * Copyright (c) 2026 Finbook. All rights reserved.
 */
package com.nero.finbook.home_nav_bar.expense

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nero.finbook.local.entity.ExpenseEntity
import com.nero.finbook.repository.ItemsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AddExpenseViewModel @Inject constructor(
    private val itemsRepository: ItemsRepository
) : ViewModel() {

    fun addExpense(expenseEntity: ExpenseEntity) {
        viewModelScope.launch {
            itemsRepository.addExpense(expenseEntity)
        }
    }

}