import { useQuery, UseQueryOptions } from 'react-query';
import diaryApi from '../../api/diaryApi';

type DatesTheDiaryExistsQueryParams = {
  year: number;
  month: number;
};

const useDatesTheDiaryExistsQuery = (
  { year, month }: DatesTheDiaryExistsQueryParams,
  options?: UseQueryOptions<number[], string>,
) =>
  useQuery(
    createkey(year, month),
    () => diaryApi.getDatesTheDiaryExists(year, month),
    options,
  );

const createkey = (year: number, month: number) => [
  'datesTheDiaryExists',
  year,
  month,
];

export default useDatesTheDiaryExistsQuery;
