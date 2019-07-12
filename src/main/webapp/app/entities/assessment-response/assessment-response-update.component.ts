import { Component, OnInit } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { JhiAlertService } from 'ng-jhipster';
import { IAssessmentResponse, AssessmentResponse } from 'app/shared/model/assessment-response.model';
import { AssessmentResponseService } from './assessment-response.service';
import { IQuestion } from 'app/shared/model/question.model';
import { QuestionService } from 'app/entities/question';

@Component({
  selector: 'jhi-assessment-response-update',
  templateUrl: './assessment-response-update.component.html'
})
export class AssessmentResponseUpdateComponent implements OnInit {
  isSaving: boolean;

  reponses: IQuestion[];

  editForm = this.fb.group({
    id: [],
    na: [],
    reponse: []
  });

  constructor(
    protected jhiAlertService: JhiAlertService,
    protected assessmentResponseService: AssessmentResponseService,
    protected questionService: QuestionService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ assessmentResponse }) => {
      this.updateForm(assessmentResponse);
    });
    this.questionService
      .query({ filter: 'assessmentresponse-is-null' })
      .pipe(
        filter((mayBeOk: HttpResponse<IQuestion[]>) => mayBeOk.ok),
        map((response: HttpResponse<IQuestion[]>) => response.body)
      )
      .subscribe(
        (res: IQuestion[]) => {
          if (!this.editForm.get('reponse').value || !this.editForm.get('reponse').value.id) {
            this.reponses = res;
          } else {
            this.questionService
              .find(this.editForm.get('reponse').value.id)
              .pipe(
                filter((subResMayBeOk: HttpResponse<IQuestion>) => subResMayBeOk.ok),
                map((subResponse: HttpResponse<IQuestion>) => subResponse.body)
              )
              .subscribe(
                (subRes: IQuestion) => (this.reponses = [subRes].concat(res)),
                (subRes: HttpErrorResponse) => this.onError(subRes.message)
              );
          }
        },
        (res: HttpErrorResponse) => this.onError(res.message)
      );
  }

  updateForm(assessmentResponse: IAssessmentResponse) {
    this.editForm.patchValue({
      id: assessmentResponse.id,
      na: assessmentResponse.na,
      reponse: assessmentResponse.reponse
    });
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.isSaving = true;
    const assessmentResponse = this.createFromForm();
    if (assessmentResponse.id !== undefined) {
      this.subscribeToSaveResponse(this.assessmentResponseService.update(assessmentResponse));
    } else {
      this.subscribeToSaveResponse(this.assessmentResponseService.create(assessmentResponse));
    }
  }

  private createFromForm(): IAssessmentResponse {
    return {
      ...new AssessmentResponse(),
      id: this.editForm.get(['id']).value,
      na: this.editForm.get(['na']).value,
      reponse: this.editForm.get(['reponse']).value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAssessmentResponse>>) {
    result.subscribe(() => this.onSaveSuccess(), () => this.onSaveError());
  }

  protected onSaveSuccess() {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError() {
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }

  trackQuestionById(index: number, item: IQuestion) {
    return item.id;
  }
}
