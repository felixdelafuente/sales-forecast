import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";

@NgModule({
  exports: [
    MatCardModule, MatIconModule, MatButtonModule
  ]
})

export class MaterialModule {}