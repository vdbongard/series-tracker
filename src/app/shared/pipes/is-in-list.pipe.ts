import { Pipe, PipeTransform } from '@angular/core';
import { ListItem } from '../../../types/interfaces/TraktList';

@Pipe({
  name: 'isInList',
})
export class IsInListPipe implements PipeTransform {
  transform(showId: number, listItems: ListItem[]): boolean {
    return listItems.map((listItem) => listItem.show.ids.trakt).includes(showId);
  }
}
