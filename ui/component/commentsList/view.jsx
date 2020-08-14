// @flow
import React, { useEffect } from 'react';
import Comment from 'component/comment';
import Spinner from 'component/spinner';
import Button from 'component/button';

type Props = {
  comments: Array<any>,
  fetchComments: string => void,
  uri: string,
  claimIsMine: boolean,
  myChannels: ?Array<ChannelClaim>,
  isFetchingComments: boolean,
  linkedComment: any,
};

function CommentList(props: Props) {
  const { fetchComments, uri, comments, claimIsMine, myChannels, isFetchingComments, linkedComment } = props;

  // const linkedCommentId = linkedComment && linkedComment.comment_id;
  const [start, setStart] = React.useState(0);
  const [end, setEnd] = React.useState(9);
  const totalComments = comments && comments.length;

  const moreBelow = totalComments - end > 0;
  const moreAbove = start;
  // todo: implement comment_list --mine in SDK so redux can grab with selectCommentIsMine
  const isMyComment = (channelId: string) => {
    if (myChannels != null && channelId != null) {
      for (let i = 0; i < myChannels.length; i++) {
        if (myChannels[i].claim_id === channelId) {
          return true;
        }
      }
    }
    return false;
  };

  const handleMoreAbove = () => {
    if (moreAbove) {
      setStart(start > 10 ? start - 10 : 0);
    }
  };

  const handleMoreBelow = () => {
    if (moreBelow) {
      setEnd(end + 10);
    }
  };

  useEffect(() => {
    fetchComments(uri);
  }, [fetchComments, uri]);

  // useEffect(() => {
  //   const handleScroll = debounce(e => {
  //     const mainEl = document.querySelector(`.${MAIN_CLASS}`);
  //
  //     if (mainEl && totalComments && end - start < totalComments) {
  //       const contentWrapperAtBottomOfPage = mainEl.getBoundingClientRect().bottom - 0.5 <= window.innerHeight;
  //
  //       if (contentWrapperAtBottomOfPage) {
  //         setEnd(end + 10);
  //       }
  //     }
  //   }, DEBOUNCE_SCROLL_HANDLER_MS);
  //
  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, [start, end, setEnd, totalComments]);

  //
  function prepareComments(arrayOfComments, linkedComment) {
    let orderedComments = [];

    if (linkedComment) {
      if (!linkedComment.parent_id) {
        orderedComments = arrayOfComments.filter(c => c.comment_id !== linkedComment.comment_id);
        orderedComments.unshift(linkedComment);
      } else {
        const parentComment = arrayOfComments.find(c => c.comment_id === linkedComment.parent_id);
        orderedComments = arrayOfComments.filter(c => c.comment_id !== linkedComment.parent_id);
        orderedComments.unshift(parentComment);
      }
    } else {
      orderedComments = arrayOfComments;
    }
    return orderedComments;
  }

  const displayedComments = prepareComments(comments, linkedComment).slice(start, end);

  return (
    <>
      {Boolean(moreAbove) && <Button button={'link'} onClick={handleMoreAbove} label={'More above'} />}
      <ul className="comments">
        {isFetchingComments && (
          <div className="main--empty">
            <Spinner />
          </div>
        )}
        {!isFetchingComments &&
          comments &&
          displayedComments &&
          displayedComments.map(comment => {
            return (
              <Comment
                uri={uri}
                authorUri={comment.channel_url}
                author={comment.channel_name}
                claimId={comment.claim_id}
                commentId={comment.comment_id}
                key={comment.comment_id}
                message={comment.comment}
                parentId={comment.parent_id || null}
                timePosted={comment.timestamp * 1000}
                claimIsMine={claimIsMine}
                commentIsMine={comment.channel_id && isMyComment(comment.channel_id)}
                linkedComment={linkedComment}
              />
            );
          })}
      </ul>
      {moreBelow && <Button button={'link'} onClick={handleMoreBelow} label={'More below'} />}
    </>
  );
}

export default CommentList;
