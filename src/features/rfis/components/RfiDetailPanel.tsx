"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Maximize2,
  Star,
  MoreVertical,
  Send,
  ArrowRight,
  FileText,
  Paperclip,
  Clock,
  DollarSign,
  Expand,
  MessageSquare,
  Plus,
  CheckCircle2,
  Edit,
  XCircle
} from 'lucide-react';
import { colors } from '@/lib/config/colors';
import RfiApiClient from '@/lib/api/rfi.api';
import toast from 'react-hot-toast';

interface RfiDetailPanelProps {
  isOpen: boolean;
  rfiId: string;
  projectId: string;
  onClose: () => void;
  onRfiUpdated: () => void;
}

export default function RfiDetailPanel({
  isOpen,
  rfiId,
  projectId,
  onClose,
  onRfiUpdated
}: RfiDetailPanelProps) {
  const [rfi, setRfi] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);

  useEffect(() => {
    if (isOpen && rfiId) {
      fetchRfiDetails();
    }
  }, [isOpen, rfiId]);

  const fetchRfiDetails = async () => {
    setIsLoading(true);
    try {
      const response = await RfiApiClient.getRfiById(projectId, rfiId);
      const rfiData = response || response;
      setRfi(rfiData);
    } catch (error) {
      console.error('Error fetching RFI details:', error);
      toast.error('Error al cargar el RFI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    setIsSendingComment(true);
    try {
      await RfiApiClient.addComment(projectId, rfiId, {
        body: commentText,
        type: 'COMMENT'
      });

      toast.success('Comentario agregado');
      setCommentText('');
      setShowCommentInput(false);
      fetchRfiDetails();
      onRfiUpdated();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error al agregar comentario');
    } finally {
      setIsSendingComment(false);
    }
  };

  const getPriorityConfig = (priority: string) => {
    const configs: any = {
      LOW: { bg: '#F0FDF4', text: '#166534', label: 'Low' },
      MEDIUM: { bg: '#FFFBEB', text: '#92400E', label: 'Medium' },
      HIGH: { bg: '#FFF7ED', text: '#9A3412', label: 'High' },
      CRITICAL: { bg: '#FEF2F2', text: '#991B1B', label: 'Critical' },
      URGENT: { bg: '#FEF2F2', text: '#991B1B', label: 'Urgent' }
    };
    return configs[priority] || configs.MEDIUM;
  };

  const getStatusConfig = (status: string) => {
    const labels: any = {
      DRAFT: { label: 'Draft', color: colors.gray[600] },
      OPEN: { label: 'Open', color: '#2563EB' },
      PENDING_OFFICIAL: { label: 'Pending', color: '#D97706' },
      CLOSED: { label: 'Closed', color: '#059669' },
      VOID: { label: 'Void', color: colors.gray[500] }
    };
    return labels[status] || labels.OPEN;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionLabel = (action: string) => {
    const labels: any = {
      CREATED: 'Created',
      STATUS_CHANGE: 'Status Changed',
      COMMENT_ADDED: 'Comment Added',
      OFFICIAL_ANSWER: 'Official Response',
      BALL_PASS: 'Ball Passed',
      EDITED: 'Edited',
      VOIDED: 'Voided'
    };
    return labels[action] || action.replace(/_/g, ' ');
  };

  // Función para obtener colores según el tipo de acción
const getActionColor = (action: string) => {
  const colors: any = {
    CREATED: { bg: '#EFF6FF', border: '#3B82F6' },
    STATUS_CHANGE: { bg: '#FEF3C7', border: '#F59E0B' },
    COMMENT_ADDED: { bg: '#F3F4F6', border: '#6B7280' },
    OFFICIAL_ANSWER: { bg: '#ECFDF5', border: '#10B981' },
    BALL_PASS: { bg: '#FEF2F2', border: '#EF4444' },
    EDITED: { bg: '#F5F3FF', border: '#8B5CF6' },
    VOIDED: { bg: '#FEE2E2', border: '#DC2626' }
  };
  return colors[action] || { bg: '#F3F4F6', border: '#9CA3AF' };
};

// Función para obtener ícono según el tipo de acción
const getActionIcon = (action: string) => {
  const icons: any = {
    CREATED: <Plus size={10} className="text-blue-600" />,
    STATUS_CHANGE: <ArrowRight size={10} className="text-orange-600" />,
    COMMENT_ADDED: <MessageSquare size={10} className="text-gray-600" />,
    OFFICIAL_ANSWER: <CheckCircle2 size={10} className="text-green-600" />,
    BALL_PASS: <Send size={10} className="text-red-600" />,
    EDITED: <Edit size={10} className="text-purple-600" />,
    VOIDED: <XCircle size={10} className="text-red-600" />
  };
  return icons[action] || <Clock size={10} className="text-gray-600" />;
};

// Función para mostrar tiempo relativo (ej: "2 hours ago")
const formatRelativeTime = (timestamp: string) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return new Date(timestamp).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  });
};

  if (!isOpen) return null;

  const officialResponse = rfi?.responses?.find((r: any) => r.isOfficial);
  const comments = rfi?.responses?.filter((r: any) => !r.isOfficial) || [];
  const priorityConfig = rfi ? getPriorityConfig(rfi.priority) : null;
  const statusConfig = rfi ? getStatusConfig(rfi.status) : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40"
        />

        {/* Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden"
        >
          {/* HEADER */}
          <div className="flex items-center px-4 py-2 border-b rounded-t-2xl border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200/60 transition-colors"
            >
              <X size={20} className="text-gray-700" />
            </button>
            <button className="p-1 rounded-full hover:bg-gray-200/60 transition-colors ml-2">
              <Expand size={18} className="text-gray-700" />
            </button>
            <h2 className="mx-auto text-sm font-semibold uppercase tracking-wide text-gray-500">
              RFI Detail
            </h2>
            <button className="p-1 rounded-full hover:bg-gray-200/60 transition-colors">
              <Star size={20} className="text-gray-700" />
            </button>
            <button className="p-1 rounded-full hover:bg-gray-200/60 transition-colors ml-2">
              <MoreVertical size={20} className="text-gray-700" />
            </button>
          </div>

          {/* CONTENIDO */}
          {isLoading ? (
            <div className="flex items-center justify-center flex-1">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800" />
            </div>
          ) : rfi ? (
            <div className="flex-1 overflow-y-auto">
              <div className="flex min-h-full">
                {/* COLUMNA IZQUIERDA */}
                <div className="flex-1 bg-white">
                  <div className="p-8 space-y-6">
                    {/* TÍTULO Y BADGES */}
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h1 className="text-3xl font-bold mb-2 text-gray-900">
                            {rfi.title}
                          </h1>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-900">
                              {rfi.rfiNumber}
                            </span>
                          </div>
                        </div>
                        <span
                          className="ml-4 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                          style={{
                            backgroundColor: priorityConfig.bg,
                            color: priorityConfig.text
                          }}
                        >
                          {priorityConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Due Date: <span className="text-gray-700">{formatDate(rfi.dueDate)}</span>
                      </p>
                    </div>

                    {/* QUESTION - Card */}
                    <div
                      className="p-5 rounded-xl border"
                      style={{
                        backgroundColor: '#FAFAFA',
                        borderColor: '#E5E7EB'
                      }}
                    >
                      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-400">
                        Question
                      </h3>
                      <p className="text-base leading-relaxed text-gray-800">
                        {rfi.question}
                      </p>
                    </div>

                    {/* PROPOSED ANSWER - Card */}
                    {rfi.proposedSolution && (
                      <div
                        className="p-5 rounded-xl border"
                        style={{
                          backgroundColor: '#FFFBEB',
                          borderColor: '#FDE68A'
                        }}
                      >
                        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-amber-800">
                          Proposed Answer
                        </h3>
                        <p className="text-base leading-relaxed text-gray-800">
                          {rfi.proposedSolution}
                        </p>
                      </div>
                    )}

                    {/* RESPUESTA OFICIAL - Card */}
                    {officialResponse && (
                      <div
                        className="p-5 rounded-xl border-2"
                        style={{
                          backgroundColor: '#F0FDF4',
                          borderColor: '#86EFAC'
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: '#10B981' }}
                            />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-green-800">
                              Official Response
                            </h3>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(officialResponse.createdAt)}
                          </span>
                        </div>
                        <p className="text-base leading-relaxed whitespace-pre-wrap text-gray-800">
                          {officialResponse.body}
                        </p>
                      </div>
                    )}

                    {/* COMMENTS - Card */}
                    <div
                      className="p-5 rounded-xl border"
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E7EB'
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Comments
                        </h3>
                        {rfi.status !== 'CLOSED' && rfi.status !== 'VOID' && (
                          <button
                            onClick={() => setShowCommentInput(!showCommentInput)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-gray-100"
                            style={{ color: '#3B82F6' }}
                          >
                            <Plus size={14} />
                            Add comment
                          </button>
                        )}
                      </div>

                      {/* Input de comentario */}
                      {showCommentInput && (
                        <div className="mb-4">
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            rows={3}
                            className="w-full px-3 py-2 text-sm rounded-lg resize-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={handleAddComment}
                              disabled={!commentText.trim() || isSendingComment}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                              style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}
                            >
                              {isSendingComment ? 'Sending...' : 'Send'}
                            </button>
                            <button
                              onClick={() => {
                                setShowCommentInput(false);
                                setCommentText('');
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {comments.length > 0 ? (
                          comments.map((comment: any, index: number) => (
                            <div key={comment.id} className="relative">
                              {index < comments.length - 1 && (
                                <div
                                  className="absolute left-4 top-8 bottom-0 w-px"
                                  style={{ backgroundColor: '#E5E7EB' }}
                                />
                              )}

                              <div className="flex gap-3">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                                  style={{
                                    backgroundColor: '#EFF6FF',
                                    color: '#3B82F6'
                                  }}
                                >
                                  {comment.authorName?.charAt(0) || 'U'}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-sm font-semibold text-gray-900">
                                      {comment.authorName || 'Usuario'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {formatDateTime(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {comment.body}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                              style={{ backgroundColor: '#F3F4F6' }}
                            >
                              <MessageSquare size={20} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-400">
                              No comments yet
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RELACIONES */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-500">
                        Relaciones
                      </h3>
                      <div className="space-y-2">
                        <RelationRow icon={<FileText size={14} />} label="Budget" value="B-LD-023 - Ladrillo Visto" />
                        <RelationRow icon={<FileText size={14} />} label="Bills" value="B-LD-023 - Ladrillo Visto" />
                        <RelationRow icon={<FileText size={14} />} label="Tasks" value="No relacionada" isEmpty />
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA */}
                <div
                  className="w-80 flex-shrink-0"
                  style={{ backgroundColor: '#FAFAFA', borderLeft: '1px solid #F3F4F6' }}
                >
                  <div className="p-6 space-y-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Details
                    </h3>

                    <div className="space-y-3">
                      <DetailRow label="Assignee" value={rfi.assignedToName || '—'} />
                      <DetailRow label="Status" value={statusConfig.label} valueColor={statusConfig.color} />
                      <DetailRow label="Ball in court" value={rfi.ballInCourtName || '—'} />
                      <DetailRow label="Drawing Nr" value={rfi.drawingNumber || '—'} />
                      <DetailRow label="Spec Section" value={rfi.specSection || '—'} />
                      <DetailRow label="Location" value={rfi.location || '—'} />

                      {(rfi.scheduleImpact || rfi.costImpact) && (
                        <div className="pt-2 pb-2 border-t border-gray-200">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Impacts</p>
                          {rfi.scheduleImpact && (
                            <div className="flex items-center justify-between py-1.5">
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Clock size={12} />
                                <span>Schedule</span>
                              </div>
                              <span className="text-xs font-semibold text-orange-600">
                                {rfi.scheduleDays} days
                              </span>
                            </div>
                          )}
                          {rfi.costImpact && (
                            <div className="flex items-center justify-between py-1.5">
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <DollarSign size={12} />
                                <span>Cost</span>
                              </div>
                              <span className="text-xs font-semibold text-red-600">
                                ${parseFloat(rfi.costAmount || '0').toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <DetailRow label="Created At" value={formatDateTime(rfi.createdAt)} />
                      <DetailRow label="Created By" value={rfi.createdByName || '—'} />
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 text-gray-500">
                        Attachments
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Paperclip size={12} />
                        <span>{rfi.attachments?.length || 0} files</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
  <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-500">
    History
  </h3>
  <div className="space-y-4">
    {rfi.history && rfi.history.length > 0 ? (
      rfi.history
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8)
        .map((event: any, index: number) => (
          <div key={event.id} className="relative">
            {/* Línea vertical conectora */}
            {index < rfi.history.slice(0, 8).length - 1 && (
              <div
                className="absolute left-3 top-6 bottom-0 w-px"
                style={{ backgroundColor: '#E5E7EB' }}
              />
            )}

            <div className="flex gap-3">
              {/* Icono/Punto del timeline */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                style={{
                  backgroundColor: getActionColor(event.action).bg,
                  border: `2px solid ${getActionColor(event.action).border}`
                }}
              >
                {getActionIcon(event.action)}
              </div>

              {/* Contenido del evento */}
              <div className="flex-1 pb-2">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {event.actorName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getActionLabel(event.action)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatRelativeTime(event.timestamp)}
                  </span>
                </div>

                {event.description && (
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">
                    {event.description}
                  </p>
                )}

                {/* Previous → New values */}
                {(event.previousValue || event.newValue) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {event.previousValue && (
                      <span className="px-2 py-1 rounded-md bg-red-50 text-red-700 font-mono text-xs">
                        {event.previousValue}
                      </span>
                    )}
                    {event.previousValue && event.newValue && (
                      <ArrowRight size={12} className="text-gray-400" />
                    )}
                    {event.newValue && (
                      <span className="px-2 py-1 rounded-md bg-green-50 text-green-700 font-mono text-xs">
                        {event.newValue}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
    ) : (
      <div className="text-center py-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
          style={{ backgroundColor: '#F3F4F6' }}
        >
          <Clock size={20} className="text-gray-400" />
        </div>
        <p className="text-sm text-gray-400">
          No history yet
        </p>
      </div>
    )}
  </div>

  {/* Ver más (si hay más de 8 eventos) */}
  {rfi.history && rfi.history.length > 8 && (
    <button
      className="text-xs font-medium text-blue-600 hover:text-blue-700 mt-3 w-full text-center"
    >
      View all history ({rfi.history.length} events)
    </button>
  )}
</div>
                    {/* <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-500">
                        History
                      </h3>
                      <div className="space-y-3">
                        {rfi.history && rfi.history.length > 0 ? (
                          rfi.history
                            .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .slice(0, 5)
                            .map((event: any) => (
                              <div key={event.id} className="text-xs">
                                <div className="flex items-baseline gap-2 mb-1">
                                  <span className="font-semibold text-gray-800">
                                    {event.actorName}
                                  </span>
                                  <span className="text-gray-500">
                                    {getActionLabel(event.action)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed mb-1">
                                  {event.description}
                                </p>
                                {(event.previousValue || event.newValue) && (
                                  <div className="flex items-center gap-1.5 mb-1">
                                    {event.previousValue && (
                                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-mono text-xs">
                                        {event.previousValue}
                                      </span>
                                    )}
                                    {event.previousValue && event.newValue && (
                                      <ArrowRight size={10} className="text-gray-400" />
                                    )}
                                    {event.newValue && (
                                      <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 font-mono text-xs">
                                        {event.newValue}
                                      </span>
                                    )}
                                  </div>
                                )}
                                <span className="text-xs text-gray-400">
                                  {formatDateTime(event.timestamp)}
                                </span>
                              </div>
                            ))
                        ) : (
                          <p className="text-xs text-gray-400 italic">No history</p>
                        )}
                      </div>
                    </div> */}

                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-500">
                        Distribution
                      </h3>
                      <div className="space-y-2">
                        {rfi.distribution && rfi.distribution.length > 0 ? (
                          rfi.distribution.map((dist: any) => (
                            <div key={dist.id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-700">{dist.userName}</span>
                              <span
                                className="px-2 py-0.5 rounded-full font-medium"
                                style={{
                                  backgroundColor: dist.role === 'REVIEWER' ? '#EFF6FF' : '#F3F4F6',
                                  color: dist.role === 'REVIEWER' ? '#1E40AF' : '#6B7280'
                                }}
                              >
                                {dist.role}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 italic">No distribution</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1">
              <p className="text-gray-500">No se pudo cargar el RFI</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between text-xs py-1.5">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right ml-2" style={{ color: valueColor || '#1F2937' }}>
        {value}
      </span>
    </div>
  );
}

function RelationRow({ icon, label, value, isEmpty }: { icon: React.ReactNode; label: string; value: string; isEmpty?: boolean }) {
  return (
    <div
      className="flex items-center gap-2 p-3 rounded-lg border"
      style={{
        borderColor: isEmpty ? '#E5E7EB' : '#F3F4F6',
        borderStyle: isEmpty ? 'dashed' : 'solid',
        backgroundColor: isEmpty ? 'transparent' : '#FAFAFA'
      }}
    >
      <div className="text-gray-400">{icon}</div>
      <span className="text-xs flex-1 text-gray-600">{label}</span>
      {isEmpty ? (
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
          + Add
        </button>
      ) : (
        <span className="text-xs font-mono px-2 py-1 rounded" style={{ backgroundColor: '#E9D5FF', color: '#6B21A8' }}>
          {value}
        </span>
      )}
    </div>
  );
}