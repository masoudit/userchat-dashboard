import { ActionCondition } from './../../../../../models/intent-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { Console } from 'console';
import { LoggerService } from 'app/services/logger/logger.service';
import { throwDialogContentAlreadyAttachedError } from '@angular/cdk/dialog';

@Component({
  selector: 'cds-action-condition',
  templateUrl: './action-condition.component.html',
  styleUrls: ['./action-condition.component.scss']
})
export class ActionConditionComponent implements OnInit {
  
  @Input() listOfActions: Array<any>;
  @Input() action: ActionCondition;

  actionConditionFormGroup: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private logger: LoggerService,) { }

  ngOnInit(): void {
    this.actionConditionFormGroup.valueChanges.subscribe(form => {
      console.log('[ACTION-CONDITION] form valueChanges-->', form)
      if(form && (form.condition !== '' || form.trueIntent !=='' || form.falseIntent !== ''))
        this.action = Object.assign(this.action, this.actionConditionFormGroup.value);
    })
  }

  ngOnChanges(){
    this.actionConditionFormGroup = this.buildForm();
    if(this.action && this.action.condition){
      this.setFormValue()
    }
    
  }


  buildForm(): FormGroup{
    return this.formBuilder.group({
      condition: ['', Validators.required],
      trueIntent: ['', Validators.required],
      falseIntent: ['', Validators.required]
    })
  }

  setFormValue(){
    this.actionConditionFormGroup.patchValue({
      condition: this.action.condition,
      trueIntent: this.action.trueIntent,
      falseIntent: this.action.falseIntent
    })
  }


}
