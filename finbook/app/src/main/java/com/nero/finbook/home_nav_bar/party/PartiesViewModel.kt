/*
 * Copyright (c) 2026 Finbook. All rights reserved.
 */
package com.nero.finbook.home_nav_bar.party

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nero.finbook.local.entity.PartyEntity
import com.nero.finbook.repository.ItemsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PartiesViewModel @Inject constructor(
    private val repository: ItemsRepository
) : ViewModel() {

    fun addParty(partyEntity: PartyEntity){
        viewModelScope.launch {
            repository.addParty(partyEntity)
        }
    }

}