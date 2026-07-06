"use client";
import React, {useState} from 'react';
import { QueryClient, QueryClientProvider} from "@tanstack/react-query"
import useSeller from '../hooks/useSeller';
import {WebSocketProvider} from '../context/web-socket-context';
import {Toaster} from 'react-hot-toast';

const Provider=({children}: {children: React.ReactNode}) => {
  const [queryClient]=useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ProvidersWithWebSocket>
        {children}
      </ProvidersWithWebSocket>
      <Toaster />
    </QueryClientProvider>
  )
}

const ProvidersWithWebSocket=({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {seller, isLoading}=useSeller();

  if(isLoading) return null;
  return (
    <>
      {seller&&<WebSocketProvider seller={seller}>{children}</WebSocketProvider>}
      {!seller && children}
    </>
  );
};

export default Provider
