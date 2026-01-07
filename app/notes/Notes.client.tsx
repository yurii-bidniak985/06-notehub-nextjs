"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { Toaster } from "react-hot-toast";

import NoteList from "@/components/NoteList/NoteList";
import Pagination from "@/components/Pagination/Pagination";
import Modal from "@/components/Modal/Modal";
import NoteForm from "@/components/NoteForm/NoteForm";
import SearchBox from "@/components/SearchBox/SearchBox";
import Loader from "@/components/Loader/Loader";

import { fetchNotes } from "@/lib/api";
import type { FetchNotesResponse } from "@/lib/api";
import css from "./Notes.client.module.css";
type Props = { initialPage: number };
export default function App({ initialPage }: Props) {
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isLoading, isError, isSuccess } = useQuery<
    FetchNotesResponse,
    Error
  >({
    queryKey: ["notes", page, debouncedSearch],
    queryFn: () => fetchNotes({ page, perPage: 12, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const notes = data?.notes || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={handleSearchChange} />
        <button className={css.button} onClick={() => setIsModalOpen(true)}>
          Create note +
        </button>
      </header>

      <main>
        {isLoading && <Loader />}

        {isError && (
          <p className={css.message}>Error loading notes. Check your token.</p>
        )}

        {isSuccess && notes.length > 0 ? (
          <NoteList notes={notes} />
        ) : (
          isSuccess &&
          !isLoading && <p className={css.message}>No notes found.</p>
        )}

        {totalPages > 1 && !isLoading && (
          <Pagination
            pageCount={totalPages}
            onPageChange={(selectedItem) => setPage(selectedItem.selected + 1)}
            currentPage={page}
          />
        )}
      </main>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm
            onSuccess={() => setIsModalOpen(false)}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      )}

      <Toaster position="top-right" />
    </div>
  );
}
