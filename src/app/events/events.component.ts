import { Component, OnInit, ANALYZE_FOR_ENTRY_COMPONENTS } from '@angular/core';
import EventsData from '../../assets/events.json';
import PromotionData from '../../assets/promotion.json';

import { FormGroup, FormBuilder } from '@angular/forms';
import * as Lodash from 'lodash';
import { ElementAst } from '@angular/compiler';


@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  public events: any = EventsData;
  public totalPrice;
  public discountedPrice;
  public promotionsOrg: any = PromotionData;
  public eventFormGroup: FormGroup;
  public appliedPromotions: any = [];
  constructor(private formBuilder: FormBuilder) {
    this.eventFormGroup = this.formBuilder.group({
      noOfTickets: ['', []]
    });
  }

  ngOnInit(): void {
  }

  public onTicketChange(event, obj) {
    this.resetPromotionData();
    this.events.find(x => x.EventID === event.EventID).Number = +obj.value;
    this.totalPrice = this.events.reduce((a, c) => {
      return a + (c.Cost * c.Number);
    }, 0);

    // this.fetchPromotion();


  }

  public fetchPromotion() {
    this.resetPromotionData();
    let selectedEvents = this.events.filter((x) => x.Number > 0)

    if (selectedEvents.length > 0) {

      this.appliedPromotions = [];
      
      const promotions= Lodash.cloneDeep(this.promotionsOrg);


      for (let p of promotions) {
        let promotionalEvent = Object.assign([], selectedEvents);

        if (p.EventID != "0") {
          promotionalEvent = selectedEvents.filter(function (se) {
            return p.EventID.includes(se.EventID)
          });
        }

        if (promotionalEvent.length > 0) {
          let noOfPromoEvents = promotionalEvent.reduce((a, c) => {
            return a + +c.Number;
          }, 0);

          if (noOfPromoEvents >= p.NumberOfEvents) {

            if (p.DiscountAmount) {
              p.CalculatedDiscount = p.DiscountAmount;
              this.appliedPromotions.push(p);

            }
            else if (p.DiscountPercent) {
              const eventWithlowestPrice = Math.min(...promotionalEvent.map(p => +p.Cost));

              const discountedValue = (p.DiscountPercent / 100) * eventWithlowestPrice;
              p.CalculatedDiscount = discountedValue;
              this.appliedPromotions.push(p);

            }
            else if (p.FreeEvent) {
              const eventWithlowestPrice = Math.min(...promotionalEvent.map(p => +p.Cost));
              p.CalculatedDiscount = eventWithlowestPrice;
              this.appliedPromotions.push(p);

            }
          }
        }
      }
      
        }

  }

  public resetPromotionData() {
    this.appliedPromotions = [];
    this.discountedPrice = "";
  }
  public togglePromotion(promotion, obj) {
    if(promotion.status && promotion.status == 1)
    {
      obj.innerText   = "Apply";
      if(this.discountedPrice){
        this.discountedPrice = this.discountedPrice + promotion.CalculatedDiscount;  
      } 
      promotion.status = 0
    }
    else
    {
      obj.innerText = "Remove";
      if(this.discountedPrice){
        this.discountedPrice = this.discountedPrice - promotion.CalculatedDiscount;  
      }
      else
      {
        this.discountedPrice = this.totalPrice - promotion.CalculatedDiscount;
      }
      promotion.status = 1
    }
   
  }

}