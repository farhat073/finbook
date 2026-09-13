/*
 * Copyright (c) 2026 Finbook. All rights reserved.
 */
package com.nero.finbook.home_nav_bar.menuItems.onClick

import com.nero.finbook.local.entity.ItemsEntity

interface OnItemClick {

    fun onClickShare(itemsEntity: ItemsEntity)
    fun onEditClick(itemsEntity: ItemsEntity)
}