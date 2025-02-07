import { FormControl } from '@angular/forms';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { calculatingRemainingCharacters } from 'app/chatbot-design-studio/utils';

@Component({
  selector: 'cds-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss']
})
export class CDSTextareaComponent implements OnInit {

  @ViewChild('autosize') autosize: CdkTextareaAutosize;


  @Input() text: string;
  @Input() limitCharsText: number;
  @Input() textMessage: string;
  @Input() control: FormControl = new FormControl();
  @Input() showUtils: boolean = true;
  @Output() change = new EventEmitter();

  // Textarea //
  leftCharsText: number;
  alertCharsText: boolean;

  constructor() { }

  ngOnInit(): void {
    console.log("limitCharsText: ", this.limitCharsText)
    console.log("showUtils: ", this.showUtils)

    this.leftCharsText = calculatingRemainingCharacters(this.text);
    if(this.leftCharsText<(this.limitCharsText/10)){
      this.alertCharsText = true;
    } else {
      this.alertCharsText = false;
    }
  }

   /** */
   onChangeTextarea(text:string) {
    this.leftCharsText = calculatingRemainingCharacters(this.text);
    if(this.leftCharsText<(this.limitCharsText/10)){
      this.alertCharsText = true;
    } else {
      this.alertCharsText = false;
    }
    this.text = text;
    this.change.emit(this.text);
  }

}