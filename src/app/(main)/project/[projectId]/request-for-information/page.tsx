"use client";

import { useState } from 'react';
import { Plus, BarChart3, Settings } from 'lucide-react';
import { colors } from '@/lib/config/colors';
import { useParams } from 'next/navigation';
import RfiList from '@/features/rfis/components/RfiList';
import RfiDetailPanel from '@/features/rfis/components/RfiDetailPanel';
// import CreateRfiPanel from '@/features/rfis/components/CreateRfiPanel';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';

type ViewMode = 'list' | 'my-ball' | 'dashboard';

export default function RfisPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRfiId, setSelectedRfiId] = useState<string | null>(null);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRfiClick = (rfiId: string) => {
    setSelectedRfiId(rfiId);
  };

  const handleCloseDetail = () => {
    setSelectedRfiId(null);
  };

  const handleRfiCreated = () => {
    setShowCreatePanel(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: colors.gray[200] }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: colors.gray[100] }}
          >
            <span className="text-xl">🏗️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.gray[900] }}>
              RFIs
            </h1>
            <p className="text-sm" style={{ color: colors.gray[500] }}>
              Requests for Information
            </p>
          </div>

          {/* TABS DE VISTA */}
          <div className="flex items-center gap-2 ml-8">
            <button
              onClick={() => setViewMode('list')}
              className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: viewMode === 'list' ? colors.gray[900] : 'transparent',
                color: viewMode === 'list' ? '#FFFFFF' : colors.gray[600]
              }}
            >
              Todos
            </button>
            <button
              onClick={() => setViewMode('my-ball')}
              className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: viewMode === 'my-ball' ? colors.blue.primary : 'transparent',
                color: viewMode === 'my-ball' ? '#FFFFFF' : colors.gray[600]
              }}
            >
              Mi Turno
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
              style={{
                backgroundColor: viewMode === 'dashboard' ? colors.mint.medium : 'transparent',
                color: viewMode === 'dashboard' ? '#FFFFFF' : colors.gray[600]
              }}
            >
              <BarChart3 size={16} />
              Dashboard
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ color: colors.gray[600] }}
          >
            <Settings size={20} />
          </button>
          <button
            onClick={() => setShowCreatePanel(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: colors.gray[900],
              color: '#FFFFFF'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[700]}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.gray[900]}
          >
            <Plus size={18} />
            Nuevo RFI
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'list' && (
          <RfiList
            projectId={projectId}
            onRfiClick={handleRfiClick}
            refreshTrigger={refreshTrigger}
            showMyBallOnly={false}
          />
        )}
        {viewMode === 'my-ball' && (
          <RfiList
            projectId={projectId}
            onRfiClick={handleRfiClick}
            refreshTrigger={refreshTrigger}
            showMyBallOnly={true}
          />
        )}
      </div>

      {/* PANEL DE DETALLE */}
      {selectedRfiId && (
        <RfiDetailPanel
          isOpen={!!selectedRfiId}
          rfiId={selectedRfiId}
          projectId={projectId}
          onClose={handleCloseDetail}
          onRfiUpdated={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}

      {/* PANEL DE CREACIÓN */}
      {/* <CreateRfiPanel
        isOpen={showCreatePanel}
        onClose={() => setShowCreatePanel(false)}
        projectId={projectId}
        createdByUserId={user?.id || ''}
        onRfiCreated={handleRfiCreated}
      /> */}
    </div>
  );
}