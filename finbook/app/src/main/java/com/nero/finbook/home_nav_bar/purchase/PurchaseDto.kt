/*
 * Copyright (c) 2026 Finbook. All rights reserved.
 */
package com.nero.finbook.home_nav_bar.purchase

data class PurchaseDto(
    val productName: String,
    val quantity: Int,
    val price: Long
) {
}