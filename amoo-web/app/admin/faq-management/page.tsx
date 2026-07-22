"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  active: number;
  created_at?: string;
  updated_at?: string;
}

const CATEGORIES = ["General", "Services", "Booking", "Payment", "Spiritual", "Technical"];

const EMPTY_FORM = { question: "", answer: "", category: "General", sort_order: 0, active: true };

export default function FaqManagementPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadFaqs = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getFaqs();
      const data = Array.isArray(res) ? res : res?.data || [];
      setFaqs(data);
    } catch {
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const filtered = faqs.filter((f) => {
    const matchSearch =
      !search ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || f.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const openCreate = () => {
    setEditingFaq(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (faq: Faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sort_order: faq.sort_order,
      active: !!faq.active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editingFaq) {
        await api.admin.updateFaq(editingFaq.id, formData);
      } else {
        await api.admin.createFaq(formData);
      }
      setShowForm(false);
      loadFaqs();
    } catch (err) {
      alert("Failed to save FAQ. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.admin.deleteFaq(deleteId);
      setDeleteId(null);
      loadFaqs();
    } catch {
      alert("Failed to delete FAQ.");
    }
  };

  return (
    <main className="flex-1 px-4 pb-8 pt-[18px] sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-[6px] text-[10.5px]">
        <span className="text-[#8B879C]">Dashboard</span>
        <ChevronRight size={12} className="text-[#B7B3C4]" />
        <span className="font-medium text-[#3D3752]">FAQ Management</span>
      </nav>

      {/* Page header */}
      <div className="mt-[14px] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-[14px]">
          <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] shadow-[0_6px_16px_rgba(109,40,217,.25)]">
            <HelpCircle size={24} strokeWidth={1.8} className="text-white" />
          </span>
          <div>
            <h1 className="font-display text-[26px] font-bold leading-none text-[#231640]">
              FAQ Management
            </h1>
            <p className="mt-[7px] text-[11px] text-[#8B879C]">
              Manage frequently asked questions shown to users across the platform.
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex h-[38px] items-center gap-[7px] rounded-[9px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-[15px] text-[11.5px] font-medium text-white shadow-[0_6px_16px_rgba(109,40,217,.25)]"
        >
          <Plus size={15} strokeWidth={2.4} />
          Add FAQ
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-[360px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B879C]" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-[36px] w-full rounded-[8px] border border-[#E5E1F0] bg-white pl-9 pr-3 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-[36px] rounded-[8px] border border-[#E5E1F0] bg-white px-3 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total FAQs", value: faqs.length },
          { label: "Active", value: faqs.filter((f) => f.active).length },
          { label: "Inactive", value: faqs.filter((f) => !f.active).length },
          { label: "Categories", value: new Set(faqs.map((f) => f.category)).size },
        ].map((s) => (
          <div key={s.label} className="rounded-[12px] border border-[#E5E1F0] bg-white p-4">
            <p className="text-[11px] text-[#8B879C]">{s.label}</p>
            <p className="mt-1 font-display text-[22px] font-bold text-[#231640]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-[12px] border border-[#E5E1F0] bg-white">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-[#E5E1F0] bg-[#FAF9FE]">
              <th className="px-4 py-3 font-medium text-[#8B879C]">Question</th>
              <th className="px-4 py-3 font-medium text-[#8B879C]">Category</th>
              <th className="px-4 py-3 font-medium text-[#8B879C]">Order</th>
              <th className="px-4 py-3 font-medium text-[#8B879C]">Status</th>
              <th className="px-4 py-3 font-medium text-[#8B879C]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[#8B879C]">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[#8B879C]">
                  No FAQs found.
                </td>
              </tr>
            ) : (
              filtered.map((faq) => (
                <tr key={faq.id} className="border-b border-[#F0EDF5] last:border-b-0 hover:bg-[#FAF9FE]">
                  <td className="max-w-[300px] truncate px-4 py-3 text-[#3D3752]">
                    {faq.question}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-[#F0EAFF] px-2.5 py-0.5 text-[10px] font-medium text-[#6D28D9]">
                      {faq.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#3D3752]">{faq.sort_order}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                        faq.active
                          ? "bg-[#E8F5E9] text-[#2E7D32]"
                          : "bg-[#FFEBEE] text-[#C62828]"
                      }`}
                    >
                      {faq.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(faq)}
                        className="rounded-md p-1.5 text-[#6D28D9] hover:bg-[#F0EAFF]"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(faq.id)}
                        className="rounded-md p-1.5 text-[#C62828] hover:bg-[#FFEBEE]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-lg rounded-[16px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#231640]">
                {editingFaq ? "Edit FAQ" : "Add FAQ"}
              </h2>
              <button onClick={() => setShowForm(false)} className="rounded-md p-1 hover:bg-gray-100">
                <X size={18} className="text-[#8B879C]" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#3D3752]">Question</label>
                <textarea
                  rows={2}
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  placeholder="Enter the question..."
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#3D3752]">Answer</label>
                <textarea
                  rows={4}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  placeholder="Enter the answer..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#3D3752]">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-[#3D3752]">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full rounded-[8px] border border-[#E5E1F0] px-3 py-2 text-[12px] text-[#3D3752] outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded"
                  id="active-check"
                />
                <label htmlFor="active-check" className="text-[12px] text-[#3D3752]">Active</label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-[8px] border border-[#E5E1F0] px-4 py-2 text-[12px] font-medium text-[#8B879C] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.question || !formData.answer}
                className="rounded-[8px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-5 py-2 text-[12px] font-medium text-white shadow-[0_4px_12px_rgba(109,40,217,.25)] disabled:opacity-50"
              >
                {editingFaq ? "Save Changes" : "Create FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-[16px] bg-white p-6 shadow-xl text-center">
            <Trash2 size={32} className="mx-auto text-[#C62828]" />
            <h2 className="mt-3 font-display text-lg font-bold text-[#231640]">Delete FAQ?</h2>
            <p className="mt-2 text-[12px] text-[#8B879C]">
              This will deactivate the FAQ. It can be reactivated later from the admin panel.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-[8px] border border-[#E5E1F0] px-4 py-2 text-[12px] font-medium text-[#8B879C] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-[8px] bg-[#C62828] px-5 py-2 text-[12px] font-medium text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
