import { css } from '@emotion/react';
import { memo, useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import useWriteDiaryMutation from '../../hooks/mutation/useWriteDiaryMutation';
import useDiariesQuery from '../../hooks/query/useDiariesQuery';
import useDiariesStatisticsQuery from '../../hooks/query/useDiariesStatisticsQuery';
import useDialogAction from '../../hooks/useDialogAction';
import useInput from '../../hooks/useInput';
import LoadingPage from '../../pages/LoadingPage';
import MainButton from '../common/MainButton';
import DiaryCard from './DiaryCard';

export type WriteFormProps = {};

const WriteForm = memo(() => {
  const [title, , handleChangeTitle] = useInput();
  const [content, , handleChangeContent] = useInput();

  const { openDialog } = useDialogAction();
  const history = useHistory();
  const queryClient = useQueryClient();

  const handleSuccessWriteDiary = () => {
    const currentYear = new Date().getFullYear();

    queryClient.invalidateQueries(useDiariesQuery.createKey());
    queryClient.invalidateQueries(
      useDiariesStatisticsQuery.createKey(currentYear),
    );

    history.push('/');
  };

  const handleErrorWriteDiary = (errorMessage: string) => {
    openDialog(errorMessage);
  };

  const { mutate, isLoading } = useWriteDiaryMutation({
    onSuccess: handleSuccessWriteDiary,
    onError: handleErrorWriteDiary,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      mutate({ title, content });
    }
  };

  const validateForm = () => {
    if (!title || !content) {
      openDialog('글을 입력하세요');
      return false;
    }

    return true;
  };

  const renderButtons = useCallback(
    () => <MainButton type="submit" label="저장" />,
    [],
  );

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <form css={box} onSubmit={handleSubmit}>
      <DiaryCard
        onChangeTitle={handleChangeTitle}
        onChangeContent={handleChangeContent}
        renderButtons={renderButtons}
      />
    </form>
  );
});

const box = css`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default WriteForm;
