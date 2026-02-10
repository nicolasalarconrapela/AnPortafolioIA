
import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

interface CompanyDashboardProps {
  userId: string;
  onLogout: () => void;
}

export const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ userId, onLogout }) => {
  return (
    <div className="min-h-screen bg-surface-variant p-6">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Icon name="business" className="text-secondary text-4xl" />
          <h1 className="text-2xl font-display font-medium">Business Center</h1>
        </div>
        <div className="flex gap-4">
          <Button variant="outlined" icon="settings">Ajustes</Button>
          <Button variant="tonal" onClick={onLogout}>Cerrar Sesión</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Mis Vacantes</h2>
            <Button size="sm" icon="add">Nueva Vacante</Button>
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="p-12 text-center">
              <Icon name="work_outline" size={48} className="text-outline opacity-20 mb-4" />
              <p className="text-outline">Aún no has publicado ninguna vacante.</p>
            </div>
          </Card>
        </section>

        <aside className="space-y-6">
          <h2 className="text-xl font-bold">Talento Sugerido</h2>
          <Card className="p-6 bg-secondary-container/20 border-secondary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-secondary-container rounded-xl text-secondary">
                <Icon name="auto_awesome" />
              </div>
              <div>
                <p className="text-sm font-bold text-secondary-onContainer">Donna AI está analizando...</p>
                <p className="text-xs text-secondary-onContainer/70 mt-1">Cuando publiques una vacante, Donna encontrará a los mejores candidatos para ti automáticamente.</p>
              </div>
            </div>
          </Card>
        </aside>
      </main>
    </div>
  );
};
