
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpDataServiceService } from '../services/http_data_service.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Authors, Title, Poetry, Data } from '../utils/interface';

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
  fetchApiData(apiUrl: string, callFor: string): void {

    this.httpService.getData(apiUrl)
      .pipe(takeUntil(this.destroyed))
      .subscribe(response => {
        if (!response) return;
        const responseBody = response.body as unknown;
        switch (callFor) {
          case 'author':
            this.titleOptions = [];
            this.titleControl.setValue('');
            const res = responseBody as Authors;
            this.authorOptions = res.authors;
            this.filterAuthorOptions();
            break;
          case 'title':
            const title = responseBody as Title[];
            
            if (!title || !title.length || title.length < 1) {
              this.titleOptions = [];
            } else {
              this.titleOptions = title;
              this.filterTitleOptions();
            }
            this.cdr.detectChanges();

            break;
          case 'poetry':
            const poet = responseBody as Poetry[];
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
  detectRhymeCouplet(poetry: Poetry) {
    poetry.rhymScheme = 'Not Found';
    const wordsArray = poetry.lines.map(this.getEnding);
    let a1 = 0;
    let a2 = 1;
    let b1 = 2;
    let b2 = 3;
    let increaseIndexBy = 4;

    for (let i = 0; i < wordsArray.length; i++) {
      if ((wordsArray[a2] === wordsArray[a1]) || wordsArray[a1].includes(wordsArray[a2]) || wordsArray[a2].includes(wordsArray[a1])) {
        if ((wordsArray[b2] === wordsArray[b1]) || wordsArray[b1].includes(wordsArray[b2]) || wordsArray[b2].includes(wordsArray[b1])) {
          poetry.rhymScheme = 'Rhyme scheme: AA BB';
          break;
        } else {
          // b2 index value should be less then array length.
          if (b2 + increaseIndexBy < wordsArray.length) {
            // If a1 index value in array is "blank", then take next index value.
            if (wordsArray[a1 + increaseIndexBy] === '') {
              increaseIndexBy += 1;
            }
            a1 += increaseIndexBy;
            a2 += increaseIndexBy;
            b1 += increaseIndexBy;
            b2 += increaseIndexBy;
          }
        }
      } else {
        if (b2 + increaseIndexBy < wordsArray.length) {
          if (wordsArray[a1 + increaseIndexBy] === '') {
            increaseIndexBy += 1;
          }
          a1 += increaseIndexBy;
          a2 += increaseIndexBy;
          b1 += increaseIndexBy;
          b2 += increaseIndexBy;
        }

      }
    }
  }

  getEnding(word: string, index: number) {
    // getting sub string from the last word of the line - vowels followed by a vowel or y.
    let str = (word.match(/[aeiou]*[aeiouy]$|[aeiou]+[^aeiou]+$/) || [''])[0];
    // Removing special character from the end of the substring.
    let modifiedStr = str.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    return modifiedStr;
  }
}
