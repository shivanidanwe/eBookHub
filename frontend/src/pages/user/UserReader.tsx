import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { OnlineReader } from '../../components/reader/OnlineReader';

export const UserReader: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();

  if (!bookId) {
    return <Navigate to="/user/library" replace />;
  }

  return <OnlineReader bookId={bookId} />;
};
