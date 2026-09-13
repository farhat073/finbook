/*
 * Copyright (c) 2026 Finbook. All rights reserved.
 */
package com.nero.finbook.home_nav_bar.expense.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.nero.finbook.R
import com.nero.finbook.home_nav_bar.expense.CategoryModel
import com.nero.finbook.home_nav_bar.expense.viewHolders.CategoriesViewHolder
import com.nero.finbook.local.entity.ExpenseEntity

class CategoriesAdapter(private val categoriesList: List<CategoryModel>) :
    RecyclerView.Adapter<CategoriesViewHolder>() {
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CategoriesViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_category_layout, parent, false)
        return CategoriesViewHolder(view)
    }

    override fun onBindViewHolder(holder: CategoriesViewHolder, position: Int) {
        val category = categoriesList[position]
        holder.setData(category)
    }

    override fun getItemCount(): Int {
        return categoriesList.size
    }
}