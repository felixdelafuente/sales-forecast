import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { DashboardService } from './dashboard.service';
import { UploadSalesModel } from '../../shared/models/upload-sales.model';
import Chart from 'chart.js/auto';
import { products } from './data/products.data';
import { stores } from './data/stores.data';
import { addMonths, format } from 'date-fns';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('salesChart') chartElement!: ElementRef;
  chart: any;
  chartData: any[] = [];
  chartVisible: boolean = false;
  notification: { status: number, title: string, body: string } | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngAfterViewInit() {
    if (this.chartData.length) {
      this.createChart();
    }
  }

  generateExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Data');

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

    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D3D3D3' }
      };
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    for (let day = 1; day <= 31; day++) {
      const date = new Date(2025, 0, day);
      const salesForDay = Math.floor(Math.random() * 5) + 1;

      for (let i = 0; i < salesForDay; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantitySold = Math.floor(Math.random() * 10) + 1;
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

    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      FileSaver.saveAs(blob, 'sales-data-template.xlsx');
    });
  }

  uploadFile(event: any) {
    const file = event.target.files[0];

    if (!file) {
      console.log("No file selected");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e: any) => {
      const data = new Uint8Array(e.target.result);

      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(data);
        const worksheet = workbook.getWorksheet(1);

        if (worksheet) {
          this.processExcelData(worksheet);
        } else {
          console.log("Error processing worksheet");
        }
      } catch (error) {
        console.log("Error uploading the file:", error);
      }
    };

    reader.onerror = (error) => {
      console.log("Error reading file:", error);
    };

    reader.readAsArrayBuffer(file);
  }

  processExcelData(worksheet: ExcelJS.Worksheet) {
    const fileData: UploadSalesModel[] = [];

    worksheet.eachRow((row, rowNumber) => {
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

    this.dashboardService.uploadSalesData(fileData).subscribe({
      next: (data: any) => {
        console.log("data", data);
        this.chartVisible = true;
        this.chartData = data;
        // Wait until the view is fully initialized before creating the chart
        setTimeout(() => {
          this.createChart();
        }, 0);
      },
      error: (error: any) => {
        this.notification = {
          status: error.status,
          title: 'Error',
          body: error.error || 'An error occurred while processing the request.'
        };
      }
    });
  }

  createChart() {
    const canvas = this.chartElement?.nativeElement as HTMLCanvasElement;
    
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    // Destroy previous chart instance if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.chartData.map(item => {
          // Add 1 month to the transactionDate
          const date = new Date(item.transactionDate);
          const newDate = addMonths(date, 1); // Increment month by 1
          return format(newDate, 'MM-dd-yyyy'); // Format the new date
        }),
        datasets: [
          {
            label: 'Predicted Sales',
            data: this.chartData.map(item => Math.round(item.predictedSales)), // Round values to whole numbers
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false,
            type: 'line' // Specify line type for predicted sales
          },
          {
            label: 'Uploaded Sales',
            data: this.chartData.map(item => item.transactionQuantity), // Use raw values for transactionQuantity
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
            type: 'bar' // Specify bar type for transaction quantity
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${Math.round(Number(context.raw))}`; // Round values to whole numbers
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Forecast Dates (Based on uploaded file)'
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10,
            },
            time: {
              unit: 'day',
              tooltipFormat: 'll', // Format of the tooltip date
            },
          },
          y: {
            title: {
              display: true,
              text: 'Sales'
            },
            beginAtZero: true
          }
        }
      }
    });
  }
}
