/*
 * Copyright (c) 2026 Finbook. All rights reserved.
 */
package com.nero.finbook.repository

import androidx.lifecycle.LiveData
import com.nero.finbook.constants.Constants
import com.nero.finbook.local.dao.FinBookDAO
import com.nero.finbook.local.entity.ExpenseEntity
import com.nero.finbook.local.entity.ItemsEntity
import com.nero.finbook.local.entity.PartyEntity
import com.nero.finbook.local.entity.TransactionEntity

class ItemsRepository(private val databaseDao: FinBookDAO) {

    fun getAllItems(): LiveData<List<ItemsEntity>> {
        return databaseDao.getAllItems()
    }

    fun getAllTransactions(): LiveData<List<TransactionEntity>> {
        return databaseDao.getAllTransactions()
    }

    fun getAllParties(): LiveData<List<PartyEntity>> {
        return databaseDao.getAllParties()
    }

    fun getAllExpenses(): LiveData<List<ExpenseEntity>> {
        return databaseDao.getAllExpenses()
    }

    suspend fun addItem(itemsEntity: ItemsEntity) {
        databaseDao.insertItem(itemsEntity)
    }

    suspend fun addParty(partyEntity: PartyEntity) {
        databaseDao.insertParty(partyEntity)
    }

    suspend fun addExpense(expenseEntity: ExpenseEntity) {
        databaseDao.insertExpense(expenseEntity)
    }

    suspend fun addTransaction(transactionEntity: TransactionEntity) {

        databaseDao.insertTransaction(transactionEntity)
        val itemList = convertBilledItemNamesToList(transactionEntity.billedItemNames)
        val itemQuantity = convertBilledItemQuantityToList(transactionEntity.billedItemQuantity)

        updateItems(itemList, itemQuantity, transactionEntity.type)
        transactionEntity.partyName?.let {
            updateParty(
                it,
                transactionEntity.type!!,
                transactionEntity.total!!
            )
        }

    }

    suspend private fun updateParty(partyName: String, type: String, total: Long) {
        val party = databaseDao.getSpecificParty(partyName)
        if (type == Constants.PURCHASE) {
            if (party != null) {
                party.amout = party.amout?.minus(total)
            }
        } else {
            if (party != null) {
                party.amout = party.amout?.plus(total)
            }
        }
        if (party != null) {
            databaseDao.updateParty(party)
        }

    }

    suspend fun updateItem(itemsEntity: ItemsEntity) {
        databaseDao.updateItems(itemsEntity)
    }

    private suspend fun updateItems(
        itemList: List<String>,
        itemQuantity: java.util.ArrayList<Int>,
        type: String?
    ) {

        for (i in itemList.indices) {

            val items = databaseDao.getSpecificItem(itemList[i])
            if (items != null) {
                if (type == Constants.PURCHASE) {
                    items.stock = items.stock?.plus(itemQuantity[i])
                } else {
                    items.stock = items.stock?.minus(itemQuantity[i])
                }
                databaseDao.updateItems(items);
            }

        }

    }

    private fun convertBilledItemNamesToList(billedItemNames: String?): List<String> {
        return billedItemNames!!.split(",")
    }

    private fun convertBilledItemQuantityToList(billedItemQuantity: String?): ArrayList<Int> {
        val data = billedItemQuantity!!.split(",")
        val list: ArrayList<Int> = ArrayList()
        for (item in data) {
            list.add(item.toInt())
        }
        return list;
    }


}