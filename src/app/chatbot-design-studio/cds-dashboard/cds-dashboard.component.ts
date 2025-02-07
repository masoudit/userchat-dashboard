import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FaqService } from '../../services/faq.service';
import { Project } from '../../models/project-model';
import { AuthService } from '../../core/auth.service';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../../services/logger/logger.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpClient } from "@angular/common/http";


import { Intent, Button, Action, Form, ActionReply, Command, Message } from '../../models/intent-model';
import { TYPE_ACTION, TYPE_INTENT_ELEMENT, TYPE_MESSAGE, TIME_WAIT_DEFAULT } from '../utils';
import { Subject } from 'rxjs';
import { FaqKbService } from 'app/services/faq-kb.service';
import { Chatbot } from 'app/models/faq_kb-model';
import { AppConfigService } from 'app/services/app-config.service';
import { DepartmentService } from 'app/services/department.service';

const swal = require('sweetalert');


@Component({
  selector: 'appdashboard-cds-dashboard',
  templateUrl: './cds-dashboard.component.html',
  styleUrls: ['./cds-dashboard.component.scss']
})
export class CdsDashboardComponent implements OnInit {

  listOfIntents: Array<Intent>;
  listOfActions: Array<string>;
  intentSelected: Intent;
  elementIntentSelected: any;

  CREATE_VIEW = false;
  EDIT_VIEW = false;
  showSpinner = false;

  id_faq_kb: string;
  id_faq: string;

  botType: string;
  project: Project;
  projectID: string;
  // openCardButton = false;

  // buttonSelected: Button;
  isChromeVerGreaterThan100: boolean;
  isOpenActionDrawer: boolean;
  eventsSubject: Subject<any> = new Subject<any>();
  upadatedIntent: Subject<Intent> = new Subject<Intent>();
  selectedChatbot: Chatbot
  activeSidebarSection: string;
  IS_OPEN: boolean = false;
  public TESTSITE_BASE_URL: string;
  public defaultDepartmentId: string;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private faqService: FaqService,
    private auth: AuthService,
    public location: Location,
    private logger: LoggerService,
    private httpClient: HttpClient,
    private faqKbService: FaqKbService,
    public appConfigService: AppConfigService,
    private departmentService: DepartmentService
  ) { }


  // SYSTEM FUNCTIONS //
  ngOnInit() {
    this.getTranslations();
    this.auth.checkRoleForCurrentProject();
    this.getUrlParams();
    // this.getFaqKbId();
    if (this.router.url.indexOf('/createfaq') !== -1) {
      this.logger.log('[CDS DSHBRD] HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      // this.createNewEmptyIntent();
      // this.getFaqKbId();
    } else {
      this.logger.log('[CDS DSHBRD] HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;
      if (this.id_faq) {
        // this.getFaqById();
        //this.MOCK_getFaqById();
      }
    }
    this.getCurrentProject();
    this.getBrowserVersion();
    this.getTestSiteUrl();
    this.getDeptsByProjectId();
    this.hideWidget()
    
  }

  private hideWidget(){
    try{
      if (window && window['tiledesk']) {
        this.logger.log('[CDS DSHBRD] HIDE WIDGET ', window['tiledesk'])
  
        window['tiledesk'].hide();
        // alert('signin reinit');
      }
    }catch(error){
      this.logger.error('tiledesk_widget_hide ERROR', error)
    }
  }



  // CUSTOM FUNCTIONS //

  /** */
  private getTranslations() {
    // this.translateCreateFaqSuccessMsg();
    // this.translateCreateFaqErrorMsg();
    // this.translateUpdateFaqSuccessMsg();
    // this.translateUpdateFaqErrorMsg();
    // this.translateWarningMsg();
    // this.translateAreYouSure();
    // this.translateErrorDeleting();
    // this.translateDone();
    // this.translateErrorOccurredDeletingAnswer();
    // this.translateAnswerSuccessfullyDeleted();
  }

  /** 
   * GET FROM ROUTE PARAMS (PASSED FROM FAQ COMPONENT):
   * THE FAQ ID - WHEN THE CALLBACK IS COMPLETED RUN GET-FAQ-BY-ID THAT RETURN THE OBJECT FAQ
   * AND THE FAQ KB ID (THEN USED IN THE GOBACK)
  */
  private getUrlParams() {
    this.route.params.subscribe((params) => {

      this.id_faq_kb = params.faqkbid;
      if (this.id_faq_kb) {
        this.getBotById(this.id_faq_kb)
      }
      this.id_faq = params.faqid;
      this.botType = params.bottype
      console.log('[CDS DSHBRD] getUrlParams  PARAMS', params);
      console.log('[CDS DSHBRD] getUrlParams  BOT ID ', this.id_faq_kb);
      console.log('[CDS DSHBRD] getUrlParams  FAQ ID ', this.id_faq);
    });
  }

  /** */
  private createNewEmptyIntent() {
    this.intentSelected = new Intent();
  }

  getBotById(botid: string) {
    console.log('getFaqById');
    this.showSpinner = true;
    this.faqKbService.getBotById(botid).subscribe((chatbot: Chatbot) => {
      console.log('[CDS DSHBRD] - GET BOT BY ID RES - chatbot', chatbot);
      if (chatbot) {
        this.selectedChatbot = chatbot
      }

    }, (error) => {
      this.logger.error('[CDS DSHBRD] - GET BOT BY ID RES - ERROR ', error);

    }, () => {
      console.log('[CDS DSHBRD] - GET BOT BY ID RES - COMPLETE ');

    });
  }


  /**
   * GET THE ID OF FAQ-KB PASSED BY FAQ PAGE (AND THAT FAQ PAGE HAS RECEIVED FROM FAQ-KB)
  */
  // private getFaqKbId() {
  //   this.id_faq_kb = this.route.snapshot.params['faqkbid'];
  //   if (this.intentSelected) {
  //     this.intentSelected.id_faq_kb = this.id_faq_kb;
  //     console.log('[CDS DSHBRD]  intentSelected ', this.intentSelected);
  //   } else {
  //     console.log('[CDS DSHBRD]  intentSelected ', this.intentSelected);
  //   }
  // }

  /**
   * GET FAQ BY ID (GET THE DATA OF THE FAQ BY THE ID PASSED FROM FAQ LIST)
   * USED TO SHOW IN THE TEXAREA THE QUESTION AND THE ANSWER THAT USER WANT UPDATE
  */
  // private getFaqById() {
  //   console.log('getFaqById');
  //   this.showSpinner = true;
  //   this.faqService.getFaqById(this.id_faq).subscribe((faq: any) => {
  //     this.logger.log('[CDS DSHBRD] - FAQ GET BY ID RES', faq);
  //     if (faq) {
  //       this.intentSelected = faq;
  //     }
  //     console.log('faq', faq);
  //     this.showSpinner = false;
  //   }, (error) => {
  //     this.logger.error('[CDS DSHBRD] - FAQ GET BY ID - ERROR ', error);
  //     this.showSpinner = false;
  //   }, () => {
  //     this.logger.log('[CDS DSHBRD] - FAQ GET BY ID - COMPLETE ');
  //     this.showSpinner = false;
  //     //this.translateTheAnswerWillBeDeleted();
  //   });
  // }

  // translateTheAnswerWillBeDeleted() {
  //   let parameter = { intent_name: this.intent_name };
  //   this.translate.get('TheAnswerWillBeDeleted', parameter).subscribe((text: string) => {
  //     this.answerWillBeDeletedMsg = text;
  //   });
  // }

  /** */
  private getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project = project;
        this.projectID = project._id
      }
    });
  }

  /** */
  private getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    });
  }




  // drop(event: CdkDragDrop<string[]>) {
  //   if (event.previousContainer === event.container) {
  //     moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  //   } else {
  //     transferArrayItem(
  //       event.previousContainer.data,
  //       event.container.data,
  //       event.previousIndex,
  //       event.currentIndex,
  //     );
  //   }
  // }


  // SERVICE FUNCTIONS //

  /**
   * !!! this function is temporary and will be replaced with a server function 
  */
  // MOCK_getFaqIntents() {
  //   let url = 'assets/mock-data/tilebot/faq/intents.json';
  //   this.httpClient.get<Intent[]>(url).subscribe(data => {
  //     this.listOfIntents = data;
  //     this.intentSelected = this.listOfIntents[0];
  //     console.log("[CDS DSHBRD] - MOCK_getFaqIntents  this.intentSelected ", this.intentSelected)
  //   });
  // }

  // MOCK_getFaqIntent() {
  //   let url = 'assets/mock-data/tilebot/faq/intent.json';
  //   this.httpClient.get<Intent>(url).subscribe(data => {

  //     this.intentSelected = data;
  //     this.elementIntentSelected = {};
  //     this.elementIntentSelected['type'] = 'action';
  //     this.elementIntentSelected['element'] = this.intentSelected.actions[0];
  //     console.log('MOCK_getFaqIntent', this.elementIntentSelected);
  //   });
  // }

  /** ADD INTENT  */
  private creatIntent() {
    console.log('creatIntent')
    this.showSpinner = true;
    let id_faq_kb = this.intentSelected.id_faq_kb;
    let questionIntentSelected = this.intentSelected.question;
    let answerIntentSelected = this.intentSelected.answer;
    let displayNameIntentSelected = this.intentSelected.intent_display_name;
    let formIntentSelected = this.intentSelected.form;
    console.log('[CDS DSHBRD] creatIntent formIntentSelected ', formIntentSelected)
    let actionsIntentSelected = this.intentSelected.actions;
    console.log('[CDS DSHBRD] creatIntent actionsIntentSelected ', actionsIntentSelected)
    let webhookEnabledIntentSelected = this.intentSelected.webhook_enabled;
    this.faqService.addIntent(
      this.id_faq_kb,
      questionIntentSelected,
      answerIntentSelected,
      displayNameIntentSelected,
      formIntentSelected,
      actionsIntentSelected,
      webhookEnabledIntentSelected
    ).subscribe((intent) => {
      this.showSpinner = false;
      console.log('[CDS DSHBRD] creatIntent RES ', intent);
      if (intent) {
        this.eventsSubject.next(intent);
        this.upadatedIntent.next(intent);
      }
    }, (error) => {
      this.showSpinner = false;
      this.logger.error('[CDS DSHBRD] CREATED FAQ - ERROR ', error);
      // if (error && error['status']) {
      //   this.error_status = error['status']
      //   if (this.error_status === 409) {
      //     this.logger.error('[CDS DSHBRD] UPDATE FAQ - ERROR - ERROR-STATUS - TRANSLATE & PRESENT MODAL');
      //     this.translateAndPresentModalIntentNameAlreadyExist(this.intent_name);
      //   }
      // }
      // =========== NOTIFY ERROR ===========
      // this.notify.showWidgetStyleUpdateNotification(this.createFaqErrorNoticationMsg, 4, 'report_problem');
    }, () => {
      this.showSpinner = false;
      this.logger.log('[CDS DSHBRD] CREATED FAQ * COMPLETE *');
      // =========== NOTIFY SUCCESS===========
      // this.notify.showWidgetStyleUpdateNotification(this.createFaqSuccessNoticationMsg, 2, 'done');
      // this.router.navigate(['project/' + this.project._id + '/bots/intents/' + this.id_faq_kb + "/" + this.botType]);
    });

  }

  /** EDIT INTENT  */
  private editIntent() {
    console.log('[CDS DSHBRD] editIntent intentSelected', this.intentSelected);
    this.showSpinner = true;
    let id = this.intentSelected.id;
    let questionIntentSelected = this.intentSelected.question;
    let answerIntentSelected = this.intentSelected.answer;
    let displayNameIntentSelected = this.intentSelected.intent_display_name;
    let formIntentSelected = this.intentSelected.form;
    let actionsIntentSelected = this.intentSelected.actions;
    let webhookEnabledIntentSelected = this.intentSelected.webhook_enabled;
    this.faqService.updateIntent(
      id,
      questionIntentSelected,
      answerIntentSelected,
      displayNameIntentSelected,
      formIntentSelected,
      actionsIntentSelected,
      webhookEnabledIntentSelected
    ).subscribe((upadatedIntent) => {
      this.showSpinner = false;
      console.log('[CDS DSHBRD] UPDATE FAQ RES', upadatedIntent);
      if (upadatedIntent) {
        this.upadatedIntent.next(upadatedIntent);
      }
    }, (error) => {
      this.showSpinner = false;
      this.logger.error('[CDS DSHBRD] UPDATE FAQ - ERROR ', error);
      // =========== NOTIFY ERROR ===========
      // this.notify.showWidgetStyleUpdateNotification(this.editFaqErrorNoticationMsg, 4, 'report_problem');

      // if (error && error['status']) {
      //   this.error_status = error['status']
      //   this.logger.error('[CDS DSHBRD] UPDATE FAQ - ERROR - ERROR-STATUS', this.error_status);

      //   if (this.error_status === 409) {
      //     this.logger.error('[CDS DSHBRD] UPDATE FAQ - ERROR - ERROR-STATUS - TRANSLATE & PRESENT MODAL');
      //     this.translateAndPresentModalIntentNameAlreadyExist(this.intent_name);
      //   }
      // }

    }, () => {
      this.showSpinner = false;
      this.logger.log('[CDS DSHBRD] UPDATE FAQ * COMPLETE *');
      // =========== NOTIFY SUCCESS===========
      // this.notify.showWidgetStyleUpdateNotification(this.editFaqSuccessNoticationMsg, 2, 'done');
    });
  }


  // EVENTS //

  /** SIDEBAR OUTPUT EVENTS */
  onClickItemList(event: string) {
    console.log('[CDS DSHBRD] active section-->', event)
    this.activeSidebarSection = event;
  }

  toggleSidebarWith(IS_OPEN) {
    // console.log('[SETTINGS-SIDEBAR] IS_OPEN ', IS_OPEN)
    this.IS_OPEN = IS_OPEN;
  }


  /** Go back to previous page */
  goBack() {
    this.location.back();
  }

  /** appdashboard-intent: Save intent */
  onSaveIntent(intent: Intent) {
    console.log('[CDS DSHBRD] onSaveIntent intent:: ', intent);
    console.log('[CDS DSHBRD] listOfIntents :: ', this.listOfIntents);
    this.intentSelected = intent;
    const intentNameAlreadyCreated = this.listOfIntents.some((el) => {
      return el.id === this.intentSelected.id
    });
    console.log('[CDS DSHBRD]  intent name already saved', intentNameAlreadyCreated);
    // console.log
    if (this.CREATE_VIEW && !intentNameAlreadyCreated) {


      this.creatIntent();
    } else if (this.EDIT_VIEW) {
      this.editIntent();
    }
  }

  /** appdashboard-intent-list: Select intent */
  onReturnListOfIntents(intents) {
    this.listOfIntents = intents;
    this.listOfActions = intents.map(a => a.intent_display_name);
    console.log('[CDS DSHBRD]  onReturnListOfIntents: listOfActions', this.listOfActions);
    console.log('[CDS DSHBRD]  onReturnListOfIntents: listOfIntents', this.listOfIntents);
  }

  onSelectIntent(intent: Intent) {
    this.EDIT_VIEW = true;
    this.intentSelected = intent;
    // this.MOCK_getFaqIntent();
    console.log("[CDS DSHBRD]  onSelectIntent - intentSelected: ", this.intentSelected);
    console.log("[CDS DSHBRD]  onSelectIntent - intentSelected: ", intent);
    console.log("[CDS DSHBRD]  onSelectIntent - intentSelected > actions: ", this.intentSelected.actions);
    console.log("[CDS DSHBRD]  onSelectIntent - intentSelected > actions length: ", this.intentSelected.actions.length);
    if (this.intentSelected.actions && this.intentSelected.actions.length > 0) {
      console.log('[CDS DSBRD] onSelectIntent elementIntentSelected Exist actions', this.intentSelected.actions[0])
      this.onActionSelected(this.intentSelected.actions[0])
    } 
   else {

      this.elementIntentSelected = {};
      this.elementIntentSelected['type'] = ''
      this.elementIntentSelected['element'] = null
    }
    console.log('[CDS DSBRD] onSelectIntent elementIntentSelected', this.elementIntentSelected)
  }

  onOpenActionDrawer(_isOpenActioDrawer: boolean) {
    console.log('[CDS DSBRD] onOpenActionDrawer - isOpenActioDrawer ', _isOpenActioDrawer)
    this.isOpenActionDrawer = _isOpenActioDrawer
  }

  onAnswerSelected(answer: string) {
    console.log('[CDS DSBRD] onAnswerSelected - answer ', answer)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.ANSWER;
    this.elementIntentSelected['element'] = answer
  }

  onActionSelected(action: Action) {
    console.log('[CDS DSBRD] onActionSelected from PANEL INTENT - action ', action)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.ACTION;
    this.elementIntentSelected['element'] = action
    console.log('[CDS DSBRD] onActionSelected from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
  }

  onQuestionSelected(intent) {
    console.log('[CDS DSBRD] onQuestionSelected from PANEL INTENT - intent ', intent)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.QUESTION;
    this.elementIntentSelected['element'] = intent
    console.log('[CDS DSBRD] onQuestionSelected from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
  }

  onIntentFormSelected(intentform: Form) {
    console.log('[CDS DSBRD] onIntentFormSelected - from PANEL INTENT intentform ', intentform)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = TYPE_INTENT_ELEMENT.FORM;
    this.elementIntentSelected['element'] = intentform
    console.log('[CDS DSBRD] onIntentFormSelected - from PANEL INTENT - this.elementIntentSelected ', this.elementIntentSelected)
  }

  onActionDeleted(event) {
    console.log('[CDS DSBRD] onActionDeleted - from PANEL INTENT event ', event)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = ''
    this.elementIntentSelected['element'] = null
  }


  onCreateIntentBtnClicked() {
    this.CREATE_VIEW = true;
    console.log('[CDS DSBRD] addNewIntent  ')
    this.intentSelected = new Intent();
    let action = new ActionReply();
    let command = new Command(TYPE_ACTION.REPLY);
    command.message = new Message('text', 'A chat message will be sent to the visitor');
    action.attributes.commands.push(command);

    // = [
    //   {
    //     type: TYPE_ACTION.REPLY,
    //     message: {
    //       text: 'A chat message will be sent to the visitor',
    //       type: 'text'
    //     }
    //   }
    // ]

    this.intentSelected.actions.push(action)
    // this.elementIntentSelected = {};
    // this.elementIntentSelected['type'] = 'new'
    console.log('[CDS DSBRD] addNewIntent intentSelected ', this.intentSelected)
    this.elementIntentSelected = {};
    this.elementIntentSelected['type'] = ''
    this.elementIntentSelected['element'] = null
  }

  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {
      console.log('[CDS DSBRD] - DEPT GET DEPTS ', departments);
      console.log('[CDS DSBRD] - DEPT BOT ID ', this.id_faq_kb);

      if (departments) {
        departments.forEach((dept: any) => {
          // console.log('[PANEL-INTENT-HEADER] - DEPT', dept);

          if (dept.default === true) {
            this.defaultDepartmentId = dept._id;
            console.log('[CDS DSBRD] - DEFAULT DEPT ID ', this.defaultDepartmentId);
          }

        })
      }
    }, error => {

      console.error('[CDS DSBRD] - DEPT - GET DEPTS  - ERROR', error);
    }, () => {
      console.log('[CDS DSBRD] - DEPT - GET DEPTS - COMPLETE')

    });
  }

  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().testsiteBaseUrl;
    console.log('[CDS DSBRD] AppConfigService getAppConfig TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }

  openTestSiteInPopupWindow() {

    const testItOutBaseUrl = this.TESTSITE_BASE_URL.substring(0, this.TESTSITE_BASE_URL.lastIndexOf('/'));
    const testItOutUrl = testItOutBaseUrl + '/chatbot-panel.html'

    const url = testItOutUrl + '?tiledesk_projectid=' + this.project._id + '&tiledesk_participants=bot_' + this.id_faq_kb + "&tiledesk_departmentID=" + this.defaultDepartmentId

    let params = `toolbar=no,menubar=no,width=815,height=727,left=100,top=100`;
    window.open(url, '_blank', params);
  }

  publishOnCommunity() {
    swal({
      title: "Publish the chatbot",
      text: 'You are about to publish the chatbot in the community',
      icon: "info",
      buttons: ["Cancel", 'Publish'],
      dangerMode: false,
    })
      .then((WillPublish) => {
        if (WillPublish) {
          this.logger.log('[CDS DSBRD] publishOnCommunity swal WillPublish', WillPublish)
          this.selectedChatbot.public = true
          this.faqKbService.updateChatbot(this.selectedChatbot).subscribe((data) => {
            console.log('[CDS DSBRD] publishOnCommunity - RES ', data)
          }, (error) => {
            swal('An error has occurred', {
              icon: "error",
            });
            console.error('[CDS DSBRD] publishOnCommunity ERROR ', error);
          }, () => {
            console.log('[CDS DSBRD] publishOnCommunity * COMPLETE *');
            swal("Done!", "The Chatbot has been published in the community", {
              icon: "success",
            }).then((okpressed) => {
             
            });
          });
        } else {
          console.log('[CDS DSBRD] publishOnCommunity (else)')
        }
      });
  }

  removeFromCommunity() {

    swal({
      title: "Are you sure",
      text: 'You are about to remove the chatbot from the community',
      icon: "warning",
      buttons: ["Cancel", 'Remove'],
      dangerMode: false,
    })
      .then((WillRemove) => {
        if (WillRemove) {
          this.logger.log('[CDS DSBRD] removeFromCommunity swal WillRemove', WillRemove)
          this.selectedChatbot.public = false
          this.faqKbService.updateChatbot(this.selectedChatbot).subscribe((data) => {
            console.log('[CDS DSBRD] removeFromCommunity - RES ', data)
          }, (error) => {
            swal('An error has occurred', {
              icon: "error",
            });
            console.error('[CDS DSBRD] removeFromCommunity ERROR ', error);
          }, () => {
            console.log('[CDS DSBRD] removeFromCommunity * COMPLETE *');
            swal("Done!", "The Chatbot has been removed from the community", {
              icon: "success",
            }).then((okpressed) => {
             
            });
          });
        } else {
          console.log('[CDS DSBRD] removeFromCommunity (else)')
        }
      });

  }


}
