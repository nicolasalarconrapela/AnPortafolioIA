import React from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Icon } from './ui/Icon';

interface DesignSystemViewProps {
  onBack: () => void;
}

export const DesignSystemView: React.FC<DesignSystemViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-surface-variant p-8 overflow-y-auto">
      <header className="max-w-6xl mx-auto mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display text-[var(--md-sys-color-on-background)] mb-2">Design System</h1>
          <p className="text-outline">Component catalog and visual regression testing ground.</p>
        </div>
        <Button onClick={onBack} variant="outlined" icon="arrow_back">Back to App</Button>
      </header>

      <main className="max-w-6xl mx-auto space-y-12 pb-24">
        
        {/* SECTION: TYPOGRAPHY & COLORS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-display text-primary border-b border-outline-variant pb-2">1. Typography & Colors</h2>
          
          <Card className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-display">Display Large</h1>
              <h2 className="text-4xl font-display">Display Medium</h2>
              <h3 className="text-2xl font-display">Display Small</h3>
              <p className="text-base font-sans">Body Medium - The quick brown fox jumps over the lazy dog.</p>
              <p className="text-sm font-sans text-outline">Body Small - Used for captions and helpers.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary text-white rounded-xl flex flex-col justify-end h-24 shadow-elevation-1">Primary</div>
              <div className="p-4 bg-primary-container text-primary-onContainer rounded-xl flex flex-col justify-end h-24">Container</div>
              <div className="p-4 bg-secondary text-white rounded-xl flex flex-col justify-end h-24 shadow-elevation-1">Secondary</div>
              <div className="p-4 bg-secondary-container text-secondary-onContainer rounded-xl flex flex-col justify-end h-24">Sec. Container</div>
              <div className="p-4 bg-error text-white rounded-xl flex flex-col justify-end h-24">Error</div>
              <div className="p-4 bg-surface text-[var(--md-sys-color-on-background)] border border-outline-variant rounded-xl flex flex-col justify-end h-24">Surface</div>
            </div>
          </Card>
        </section>

        {/* SECTION: BUTTONS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-display text-primary border-b border-outline-variant pb-2">2. Buttons</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="filled" className="space-y-4">
              <h3 className="text-sm font-bold text-outline uppercase tracking-wider">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="filled">Filled</Button>
                <Button variant="tonal">Tonal</Button>
                <Button variant="outlined">Outlined</Button>
                <Button variant="text">Text</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </Card>

            <Card variant="filled" className="space-y-4">
              <h3 className="text-sm font-bold text-outline uppercase tracking-wider">States</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="filled" loading>Loading</Button>
                <Button variant="filled" disabled>Disabled</Button>
                <Button variant="outlined" disabled>Disabled</Button>
              </div>
            </Card>

            <Card variant="filled" className="space-y-4">
              <h3 className="text-sm font-bold text-outline uppercase tracking-wider">Sizes & Icons</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button size="sm" icon="add">Small</Button>
                <Button size="md" icon="edit">Medium</Button>
                <Button size="lg" endIcon="arrow_forward">Large</Button>
              </div>
            </Card>
          </div>
        </section>

        {/* SECTION: INPUTS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-display text-primary border-b border-outline-variant pb-2">3. Inputs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="space-y-6">
              <h3 className="text-sm font-bold text-outline uppercase tracking-wider">Standard States</h3>
              <Input label="Default Input" placeholder="Type something..." />
              <Input label="With Icon" startIcon="search" placeholder="Search..." />
              <Input label="With Action" type="password" value="Secret123" endIcon="visibility" onEndIconClick={() => {}} />
            </Card>

            <Card className="space-y-6">
              <h3 className="text-sm font-bold text-outline uppercase tracking-wider">Validation States</h3>
              <Input label="Error State" value="Invalid Value" error="This field format is incorrect" startIcon="error" />
              <Input label="Disabled State" disabled value="Cannot change this" />
            </Card>
          </div>
        </section>

        {/* SECTION: CARDS & SURFACES */}
        <section className="space-y-6">
          <h2 className="text-2xl font-display text-primary border-b border-outline-variant pb-2">4. Cards & Elevations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="elevated" hoverable>
              <h3 className="font-bold mb-2">Elevated Card</h3>
              <p className="text-outline text-sm">Standard container for content. Has shadow and white background. Hover me!</p>
            </Card>
            
            <Card variant="filled">
              <h3 className="font-bold mb-2">Filled Card</h3>
              <p className="text-outline text-sm">Lower emphasis. Uses surface-variant background color.</p>
            </Card>

            <Card variant="outlined">
              <h3 className="font-bold mb-2">Outlined Card</h3>
              <p className="text-outline text-sm">Transparent background with a border. Used for boundaries.</p>
            </Card>
          </div>
        </section>

        {/* SECTION: ICONS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-display text-primary border-b border-outline-variant pb-2">5. Iconography</h2>
          <Card>
            <div className="flex flex-wrap gap-8 text-outline">
              <div className="flex flex-col items-center gap-2">
                <Icon name="home" size="xl" />
                <span className="text-xs">XL (24px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Icon name="settings" size="lg" />
                <span className="text-xs">LG (20px)</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-primary">
                <Icon name="favorite" size="md" filled />
                <span className="text-xs">MD Filled</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Icon name="search" size="sm" />
                <span className="text-xs">SM (14px)</span>
              </div>
            </div>
          </Card>
        </section>

      </main>
    </div>
  );
};