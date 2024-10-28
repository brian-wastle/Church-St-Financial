import { Injectable } from '@angular/core';
import lunr from 'lunr';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private index: lunr.Index | null = null;
  private documents: any[] = [];

  constructor() {
  }

  private createIndex(docs: any[]): lunr.Index {
    return lunr(function () {
        this.ref('name');
        this.field('description');
        this.field('industry');
        this.field('sector');
        this.field('officialSite');

        docs.forEach((doc) => {
            this.add(doc);
        }, this);
    });
}

setDocuments(docs: any[]) {
    this.documents = docs.map(doc => {
        return {
            ticker: doc.ticker?.S?.replace(/#metadata$/, '') || null,
            sector: doc.sector?.S || null,
            industry: doc.industry?.S || null,
            description: doc.description?.S || null,
            officialSite: doc.officialSite?.S || null,
            name: doc.name?.S || null
        };
    });

    
    this.index = this.createIndex(this.documents);
}

  search(query: string) {
    if (!this.index) {
      console.warn('Index is not created.');
      return [];
    }

    return this.index.search(query).map(result => {
      return this.documents.find(doc => doc.name === result.ref);
    });
  }
}
