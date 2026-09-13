/*
 * Copyright (c) 2026 Finbook. All rights reserved.
 */
package com.nero.finbook.home_nav_bar.expense.viewHolders

import android.view.View
import androidx.recyclerview.widget.RecyclerView
import com.nero.finbook.local.entity.ExpenseEntity
import kotlinx.android.synthetic.main.item_category_layout.view.*

class ItemsViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    fun setData(expenseEntity: ExpenseEntity) {
        itemView.apply {
            categoryName.text = expenseEntity.itemName.toString()
            categoryAmt.text = expenseEntity.price.toString()
        }
    }
}