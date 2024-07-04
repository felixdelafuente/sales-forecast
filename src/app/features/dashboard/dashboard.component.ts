import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { coffeeProducts } from './data/products.data';
import { customerTypes } from './data/customers.data';
import { storeLocations } from './data/locations.data';
import { storeNames } from './data/stores.data';
import { DashboardService } from './dashboard.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule],
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
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Product ID', key: 'product_id', width: 20 },
      { header: 'Product Name', key: 'product_name', width: 20 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Price', key: 'price', width: 20 },
      { header: 'Quantity Sold', key: 'quantity_sold', width: 20 },
      { header: 'Sales Amount', key: 'sales_amount', width: 20 },
      { header: 'Store Name', key: 'store_name', width: 20 },
      { header: 'Store Location', key: 'store_location', width: 20 },
      { header: 'Customer Type', key: 'customer_type', width: 20 }
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
        const product = coffeeProducts[Math.floor(Math.random() * coffeeProducts.length)];
        const quantitySold = Math.floor(Math.random() * 10) + 1; // 1 to 10 items sold
        const salesAmount = product.price * quantitySold;
        const storeName = storeNames[Math.floor(Math.random() * storeNames.length)];
        const storeLocation = storeLocations[Math.floor(Math.random() * storeLocations.length)];
        const customerType = customerTypes[Math.floor(Math.random() * customerTypes.length)];

        worksheet.addRow({
          date: date.toISOString().split('T')[0],
          product_id: product.id,
          product_name: product.name,
          category: product.category,
          price: product.price,
          quantity_sold: quantitySold,
          sales_amount: salesAmount,
          store_name: storeName,
          store_location: storeLocation,
          customer_type: customerType
        });
      }
    }

    // Generate a buffer
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      FileSaver.saveAs(blob, 'sales-data-template.xlsx');
    });
  }
  
  uploadFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);

    this.dashboardService
      .uploadSalesData(formData)
      .subscribe({
        next: (data: any) => {
          console.log(data);
        },
        error: (error: any) => {
          console.log(error);
        }
      })
  }

}
