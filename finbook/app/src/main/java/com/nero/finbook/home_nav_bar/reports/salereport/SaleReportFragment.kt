/*
 * Copyright (c) 2026 Finbook. All rights reserved.
 */
package com.nero.finbook.home_nav_bar.reports.salereport

import android.app.Application
import android.content.Intent
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.net.Uri
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Observer
import androidx.recyclerview.widget.LinearLayoutManager
import com.nero.finbook.R
import com.nero.finbook.home_nav_bar.reports.salereport.recyclerview.SalesReportAdapter
import com.nero.finbook.local.entity.TransactionEntity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.android.synthetic.main.activity_sale_report.*
import kotlinx.android.synthetic.main.fragment_sale_report.*
import kotlinx.android.synthetic.main.fragment_sale_report.salesRecyclerView
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat


@AndroidEntryPoint
class SaleReportFragment : Fragment() {

    var transactions = mutableListOf<TransactionEntity>()
    private val salesReportViewModel: SaleReportViewModel by viewModels()
    val adapter = SalesReportAdapter(transactions)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_sale_report, container, false)
    }

    companion object {

        fun newInstance() = SaleReportFragment()

    }

    override fun onResume() {
        super.onResume()
        salesReportViewModel.getReport().observe(this, Observer {
            transactions.clear()
            transactions.addAll(it)
            adapter.notifyDataSetChanged()
        })
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {

        salesRecyclerView.layoutManager = LinearLayoutManager(context)
        salesRecyclerView.adapter = adapter

        ibExportPdf.setOnClickListener {
            if (Build.VERSION.SDK_INT > Build.VERSION_CODES.M){
                savePdf()
            }
        }
    }

    @RequiresApi(Build.VERSION_CODES.N)
    private fun savePdf() {
        val pdfDocument = PdfDocument()
        val mFileName = SimpleDateFormat("yyyyMMdd_HHmmss").format(System.currentTimeMillis())
        val mFilePath = Environment.getExternalStorageDirectory().toString() + "/" + mFileName + ".pdf"

        try {
            // Create a page info for A4 size
            val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
            val page = pdfDocument.startPage(pageInfo)
            val canvas = page.canvas

            // Create paints
            val titlePaint = Paint().apply {
                textSize = 20f
                isFakeBoldText = true
            }
            val headerPaint = Paint().apply {
                textSize = 14f
                isFakeBoldText = true
            }
            val textPaint = Paint().apply {
                textSize = 12f
            }

            // Draw title
            var yPosition = 50f
            canvas.drawText("Sale Report", 200f, yPosition, titlePaint)

            yPosition += 30f
            canvas.drawText("Generated: $mFileName", 50f, yPosition, textPaint)

            yPosition += 30f
            // Draw header
            canvas.drawText("Date", 50f, yPosition, headerPaint)
            canvas.drawText("Party", 150f, yPosition, headerPaint)
            canvas.drawText("Amount", 350f, yPosition, headerPaint)
            canvas.drawText("GST", 480f, yPosition, headerPaint)

            yPosition += 5f
            // Draw line under header
            val linePaint = Paint().apply {
                strokeWidth = 1f
            }
            canvas.drawLine(50f, yPosition, 545f, yPosition, linePaint)

            yPosition += 20f
            // Draw transaction data
            for (transaction in transactions) {
                val date = transaction.date ?: ""
                val partyName = transaction.partyName ?: ""
                val amount = transaction.amount?.toString() ?: "0"
                val gst = transaction.gst?.toString() ?: "0"

                canvas.drawText(date, 50f, yPosition, textPaint)
                canvas.drawText(partyName, 150f, yPosition, textPaint)
                canvas.drawText(amount, 350f, yPosition, textPaint)
                canvas.drawText(gst, 480f, yPosition, textPaint)

                yPosition += 20f

                // Start new page if we're running out of space
                if (yPosition > 800f) {
                    pdfDocument.finishPage(page)
                    val newPageInfo = PdfDocument.PageInfo.Builder(595, 842, pdfDocument.pages.size + 1).create()
                    val newPage = pdfDocument.startPage(newPageInfo)
                    val newCanvas = newPage.canvas
                    yPosition = 50f
                    // Redraw header on new page
                    newCanvas.drawText("Sale Report (cont.)", 200f, yPosition, titlePaint)
                    yPosition += 30f
                    newCanvas.drawText("Date", 50f, yPosition, headerPaint)
                    newCanvas.drawText("Party", 150f, yPosition, headerPaint)
                    newCanvas.drawText("Amount", 350f, yPosition, headerPaint)
                    newCanvas.drawText("GST", 480f, yPosition, headerPaint)
                    yPosition += 20f
                }
            }

            pdfDocument.finishPage(page)

            // Write to file
            val file = File(mFilePath)
            val fileOutputStream = FileOutputStream(file)
            pdfDocument.writeTo(fileOutputStream)
            pdfDocument.close()
            fileOutputStream.close()

            if (file.exists()) {
                val path: Uri = Uri.fromFile(file)
                val objIntent = Intent(Intent.ACTION_VIEW)
                objIntent.setDataAndType(path, "application/pdf")
                objIntent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
                startActivity(objIntent)
            } else {
                Toast.makeText(activity, "The file not exists! ", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(activity, "Error creating PDF: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

}
