
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpDataServiceService } from '../services/http_data_service.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Authors, Title, Poetry } from '../utils/interface';

const POET_BASE_API_URL = 'https://poetrydb.org/author';

/**
 * Poetry Component
 * Displaying poetry based on Author and Title search.
 */
@Component({
  selector: 'app-poetry',
  templateUrl: 'poetry.component.html',
  styleUrls: ['poetry.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PoetryComponent implements OnInit, OnDestroy {
  private readonly destroyed = new ReplaySubject<void>(1);

  private authorOptions: string[] = [];
  private titleOptions: Title[] = [];

  rhymNotAvailable = true;

  selectedAuthore = '';
  selectedTitle = '';

  authorControl = new FormControl();
  titleControl = new FormControl({ value: '', disabled: this.selectedAuthore === '' });
  filteredAuthOptions?: Observable<string[]>;
  filteredTitleOptions?: Observable<Title[]>;
  poetry: Poetry[] = [];

  constructor(
    private readonly httpService: HttpDataServiceService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  /**
   * Assigning the auto complete options to Author and Title search fields.
   * and calling the "Author" API on page load.
   */
  ngOnInit(): void {
    this.fetchApiData(POET_BASE_API_URL, 'author');
  }

  /**
   * authorControl is Array of string.
   */
  filterAuthorOptions() {
    this.filteredAuthOptions = this.authorControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterAuth(value))
    );
    this.cdr.detectChanges();
  }

  /**
   * titleControl is Array of Object and object contain title key value pair.
   */
  filterTitleOptions() {
    this.filteredTitleOptions = this.titleControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.title),
      map(title => title ? this.filterTitle(title) : this.titleOptions.slice())
    );
    this.cdr.detectChanges();
  }

  /**
   * Filtering the Authore list assigned to Author search field.
   * As user enter the values in field matched author value is filtered.
   * 
   */
  private filterAuth(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.authorOptions.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }

  /**
   * Filtering the Title list assigned to Title search field.
   * As user enter the values in field matched title value is filtered.
   * 
   */
  private filterTitle(value: string): Title[] {
    const filterValue = value.toLowerCase();
    return this.titleOptions?.filter(option => option.title.toLowerCase().indexOf(filterValue) === 0);

  }

  /**
   * This method called on search field blur.
   * User enter Author name and focus out from AUthor field API call will be initiate 
   * to get the all title for the entered Author name.
   * 
   */
  getOption(id: string, value: string) {
    //this.selectedAuthore ='';

    switch (id) {
      case 'author':
        this.selectedTitle = '';
        this.titleControl.setValue('');
        this.poetry = [];

        if (!value) {
          this.titleControl.disable();
        } else {
          this.titleControl.enable();
          this.selectedAuthore = value;
          const titleApi = `${POET_BASE_API_URL}/${this.selectedAuthore}/title`;
          this.fetchApiData(titleApi, 'title');
        }
        break;
      case 'title':
        if (!value) {
          this.selectedTitle = '';
        } else {
          this.selectedTitle = value;
        }

        break;
      default:
    }
    this.cdr.detectChanges();
  }

  /**
   * Search button Event handle.
   * Make api call with Author and title value.
   */
  getPoetry(event: MouseEvent) {
    const poetryApi = `${POET_BASE_API_URL},title/${this.selectedAuthore};${this.selectedTitle}`;
    this.fetchApiData(poetryApi, 'poetry');
  }

  /**
  * Api call for Author, title and poetry.
  * and based on callFor catagory api response will be assigned to respective variables.
 */
  fetchApiData<T>(apiUrl: string, callFor: string): void {

    this.httpService.getData<T>(apiUrl)
      .pipe(takeUntil(this.destroyed))
      .subscribe((response: T[]) => {
        if (!response) return;
        switch (callFor) {
          case 'author':
            this.titleOptions = [];
            this.titleControl.setValue('');
            const res = response as unknown as Authors;
            this.authorOptions = res.authors;
            this.filterAuthorOptions();
            break;
          case 'title':
            const title = response as unknown as Title[];
            if (!title || !title.length || title.length < 1) {
              this.titleOptions = [];
            } else {
              this.titleOptions = title;
              this.filterTitleOptions();
            }
            this.cdr.detectChanges();
            
            break;
          case 'poetry':
            const poet = response as unknown as Poetry[];
            this.poetry = [];
            if (!poet || !poet.length || poet.length < 1) {
              this.rhymNotAvailable = true;
            } else {
              this.poetry = poet;
              this.rhymNotAvailable = false;
              for (let i in this.poetry) {
                this.poetry[i].rhym = this.poetry[i].lines.join('\r\n');
                this.detectRhymeCouplet(this.poetry[i])
               
              }
            };
            break;
          default:

        }
        this.cdr.detectChanges();
      })
  }

  /** 
  * this method unsubscribe all events on page unload
  * which are subscribed.
  */
  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /**
   * This method is detecting “AA BB” couplet rhyme scheme 
   */
  detectRhymeCouplet(poetry:Poetry) {

    console.log("poetry : ",poetry.lines);
   // poetry.rhymScheme = 'Not Found';
   console.log(poetry.lines.map(this.getEnding));
  }

  getEnding(word:string) {
    return (word.match(/[aeiou]*[aeiouy]$|[aeiou]+[^aeiou]+$/) || [''])[0];
}
}
