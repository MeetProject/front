import { ChangeEvent, FormEvent, KeyboardEvent, useRef, useState } from 'react';

import * as Icon from '@/asset/svg';
import { ButtonTag } from '@/components';

interface ChatInputProps {
  onSubmit: (value: string) => Promise<void> | void;
}

export default function ChatInput({ onSubmit }: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [chat, setChat] = useState<string>('');
  const [isPending, setIsPending] = useState<boolean>(false);

  const handleInputChage = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setChat(e.target.value);

    if (!inputRef.current) {
      return;
    }
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
  };

  const handleChatSubmit = async () => {
    if (isPending) {
      return;
    }
    setIsPending(true);
    try {
      await onSubmit(chat);
      setChat('');
      if (!inputRef.current) {
        return;
      }
      inputRef.current.style.height = 'auto';
    } catch {
    } finally {
      setIsPending(false);
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await handleChatSubmit();
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.nativeEvent.isComposing) {
        return;
      }

      e.preventDefault();
      await handleChatSubmit();
    }
  };

  return (
    <form
      className='relative m-4 flex items-center justify-center bg-transparent'
      name='message'
      onSubmit={handleFormSubmit}
    >
      <div className='flex w-full items-center rounded-[25px] border border-[rgb(68,71,70)] bg-[rgb(32,33,36)]'>
        <textarea
          className='text-device-button-item my-2 flex max-h-32 w-full resize-none items-center justify-center bg-[rgb(32,33,36)] pl-4 outline-none'
          name='message'
          placeholder='메시지 보내기'
          ref={inputRef}
          rows={1}
          value={chat}
          onChange={handleInputChage}
          onKeyDown={handleKeyDown}
        />
        <div>
          <ButtonTag name='메시지 보내기'>
            <button
              className='group flex size-12 items-center justify-center'
              disabled={!chat.trim() || isPending}
              type='submit'
            >
              <Icon.Submit
                className='group-disabled:fill-device-button-item fill-device-button-selected-bg group-disabled:opacity-20'
                height={24}
                width={24}
              />
            </button>
          </ButtonTag>
        </div>
      </div>
    </form>
  );
}
