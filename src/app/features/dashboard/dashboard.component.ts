import { Component } from '@angular/core';
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { DashboardService } from './dashboard.service';
import { products } from './data/products.data';
import { stores } from './data/stores.data';
import { UploadSalesModel } from '../../shared/models/upload-sales.model';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  constructor(
    private dashboardService: DashboardService,
  ) {}

  generateExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Data');

    // Define columns
    worksheet.columns = [
      { header: 'transactionId', key: 'transactionId', width: 20 },
      { header: 'transactionDate', key: 'transactionDate', width: 20 },
      { header: 'transactionQuantity', key: 'transactionQuantity', width: 20 },
      { header: 'storeLocation', key: 'storeLocation', width: 20 },
      { header: 'unitPrice', key: 'unitPrice', width: 20 },
      { header: 'productCategory', key: 'productCategory', width: 20 },
      { header: 'productType', key: 'productType', width: 20 },
      { header: 'productDetail', key: 'productDetail', width: 20 },
    ];

    // Set header style
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D3D3D3' }
      };
      cell.font = {
        bold: true
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center'
      };
    });

    for (let day = 1; day <= 31; day++) {
      const date = new Date(2025, 0, day);
      const salesForDay = Math.floor(Math.random() * 5) + 1; // 1 to 5 sales per day

      for (let i = 0; i < salesForDay; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantitySold = Math.floor(Math.random() * 10) + 1; // 1 to 10 items sold
        const salesAmount = product.price * quantitySold;
        const storeName = stores[Math.floor(Math.random() * stores.length)];

        worksheet.addRow({
          transactionId: i + 1,
          transactionDate: date.toISOString().split('T')[0],
          transactionQuantity: quantitySold,
          storeLocation: storeName,
          unitPrice: product.price,
          productCategory: product.category,
          productType: product.type,
          productDetail: product.detail,
        });
      }
    }

    // Generate a buffer
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      FileSaver.saveAs(blob, 'sales-data-template.xlsx');
    });
  }
  
  uploadFile(event: any) {
    console.log("event:", event);

    const file = event.target.files[0];

    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("file:", file);

    const reader = new FileReader();

    reader.onload = async (e: any) => {
      console.log("e:", e);

      const data = new Uint8Array(e.target.result);
      console.log("data:", data);

      try {
        const workbook = new ExcelJS.Workbook();
        console.log("workbook:", workbook);

        await workbook.xlsx.load(data);
        const worksheet = workbook.getWorksheet(1);
        console.log("worksheet:", worksheet);

        if (worksheet) {
          this.processExcelData(worksheet);
        } else {
          console.log("Error processing worksheet", worksheet);
        }
      } catch (error) {
        console.log("Error uploading the file:", error);
      }
    };

    reader.onerror = (error) => {
      console.log("Error reading file:", error);
    };

    reader.readAsArrayBuffer(file); // Read the file to trigger onload event
  }

  processExcelData(worksheet: ExcelJS.Worksheet) {
    const fileData: UploadSalesModel[] = [];

    worksheet.eachRow((row, rowNumber) => {
      // Skip the header row if there's one
      if (rowNumber === 1) return;

      const rowData = {
        transactionId: row.getCell(1).value as number,
        transactionDate: new Date(row.getCell(2).value as string),
        transactionQuantity: row.getCell(3).value as number,
        storeLocation: row.getCell(4).value as string,
        unitPrice: row.getCell(5).value as number,
        productCategory: row.getCell(6).value as string,
        productType: row.getCell(7).value as string,
        productDetail: row.getCell(8).value as string,
      };

      fileData.push(rowData);
    });

    console.log("fileData:", fileData);

    this.dashboardService.uploadSalesData(fileData).subscribe({
      next: (data: any) => {
        console.log("Upload successful:", data);
      },
      error: (error: any) => {
        console.log("Error uploading data:", error);
      }
    });
  }

}
