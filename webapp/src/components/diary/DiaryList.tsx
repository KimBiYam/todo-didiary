import { css } from '@emotion/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { COLORS } from '../../constants';
import useDatesTheDiaryExistsQuery from '../../hooks/query/useDatesTheDiaryExistsQuery';
import useDiariesQuery from '../../hooks/query/useDiariesQuery';
import useScrollObserver from '../../hooks/useScrollObserver';
import LoadingPage from '../../pages/LoadingPage';
import { BREAK_POINTS } from '../../styles/breakPoints';
import { DatesTheDiaryExistsQueryParams, Diary } from '../../types/diary.types';
import dateUtil from '../../utils/dateUtil';
import DatePicker from '../common/DatePicker';
import DiaryEmptyError from './DiaryEmptyError';
import DiaryItem from './DiaryItem';
import DiaryItemSkeleton from './DiaryItemSkeleton';

export type DiaryListProps = {};

const PAGE_LIMIT = 10;

const DiaryList = () => {
  const history = useHistory();
  const scrollableTriggerRef = useRef<HTMLDivElement>(null);

  const currentDate = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [yearMonth, setYearMonth] = useState<DatesTheDiaryExistsQueryParams>({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  });

  const {
    data: diaries,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    isFetching,
  } = useDiariesQuery({
    limit: PAGE_LIMIT,
    createdDate:
      selectedDate && dateUtil.getFormattedDate(selectedDate.toDateString()),
  });

  const { data: existsDates } = useDatesTheDiaryExistsQuery(yearMonth);

  const isShowSkeleton = useMemo(
    () => isFetchingNextPage || isLoading,
    [isFetchingNextPage, isLoading],
  );

  useScrollObserver({
    targetRef: scrollableTriggerRef,
    enabled: hasNextPage,
    onIntersect: fetchNextPage,
  });

  const handleDiaryItemClick = useCallback(
    (diary: Diary) => history.push(`/diary/${diary.id}`),
    [],
  );

  const handleMonthChange = useCallback(
    (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      setYearMonth({ year, month });
    },
    [setYearMonth],
  );

  const handleDateChange = useCallback(
    (date: Date) => {
      setSelectedDate(date);
    },
    [setSelectedDate],
  );

  const handleDateResetClick = useCallback(() => {
    setSelectedDate(undefined);
  }, [setSelectedDate]);

  if (diaries?.pages[0].length === 0) {
    return <DiaryEmptyError />;
  }

  if (isFetching && !isFetchingNextPage && !isLoading) {
    return <LoadingPage />;
  }

  return (
    <div css={box}>
      <div>
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          onMonthChange={handleMonthChange}
          existsDates={existsDates}
        />
        {selectedDate && (
          <button css={dateResetButton} onClick={handleDateResetClick}>
            날짜 초기화
          </button>
        )}
      </div>
      <div css={diarySection}>
        {diaries &&
          diaries.pages.map((diaries) =>
            diaries.map((diary) => (
              <DiaryItem
                key={diary.id}
                diary={diary}
                onClick={handleDiaryItemClick}
              />
            )),
          )}
        {isShowSkeleton &&
          Array.from({ length: PAGE_LIMIT }).map((_, index) => (
            <DiaryItemSkeleton key={index} />
          ))}
        {hasNextPage && !isFetchingNextPage && (
          <div ref={scrollableTriggerRef} />
        )}
      </div>
    </div>
  );
};

const box = css`
  padding: 2rem;
`;

const dateResetButton = css`
  background: none;
  border: none;
  font-size: 1.6rem;
  color: ${COLORS.quaternary};
  cursor: pointer;
`;

const diarySection = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(24rem, 1fr));

  ${BREAK_POINTS.medium} {
    grid-template-columns: repeat(auto-fill, minmax(36rem, 1fr));
  }

  ${BREAK_POINTS.large} {
    grid-template-columns: repeat(auto-fill, minmax(48rem, 1fr));
  }
`;

export default DiaryList;
