'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import BottomNav from '@/components/navigation/BottomNav';
import ProfileHeader from '@/components/profiel/ProfileHeader';
import StatisticsSection from '@/components/profiel/StatisticsSection';
import SettingsSection from '@/components/profiel/SettingsSection';
import EditNameModal from '@/components/profiel/EditNameModal';
import ChangePasswordModal from '@/components/profiel/ChangePasswordModal';
import DeleteAccountModal from '@/components/profiel/DeleteAccountModal';

interface ProfileData {
  name: string | null;
  email: string | null;
}

interface Statistics {
  inventoryCount: number;
  basicInventoryCount: number;
  adaptedRecipesCount: number;
}

export default function ProfielPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [statistics, setStatistics] = useState<Statistics>({
    inventoryCount: 0,
    basicInventoryCount: 0,
    adaptedRecipesCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/onboarding');
          return;
        }

        // Load profile, inventory count, basic inventory count, and adapted recipes count in parallel
        const [profileResult, inventoryResult, basicInventoryResult, adaptedRecipesResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single(),
          supabase
            .from('inventory')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('basic_inventory')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('user_recipe_adaptations')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
        ]);

        setProfile({
          name: profileResult.data?.name || null,
          email: user.email || null,
        });

        setStatistics({
          inventoryCount: inventoryResult.count || 0,
          basicInventoryCount: basicInventoryResult.count || 0,
          adaptedRecipesCount: adaptedRecipesResult.count || 0,
        });
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router, supabase]);

  const handleNameUpdated = async () => {
    // Reload profile data
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(prev => prev ? { ...prev, name: data.name } : null);
      }
    }
    setIsEditNameModalOpen(false);
  };

  const handlePasswordChanged = () => {
    setIsChangePasswordModalOpen(false);
  };

  const handleAccountDeleted = () => {
    router.push('/onboarding');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF7]">
        <p className="text-[#2B2B2B]">Laden...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF7]">
      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-6 py-4">
          {/* Profile Header */}
          <ProfileHeader
            name={profile?.name ?? null}
            email={profile?.email ?? null}
            onEditName={() => setIsEditNameModalOpen(true)}
          />

          {/* Statistics Section */}
          <StatisticsSection statistics={statistics} />

          {/* Settings Section */}
          <SettingsSection
            onEditName={() => setIsEditNameModalOpen(true)}
            onChangePassword={() => setIsChangePasswordModalOpen(true)}
            onDeleteAccount={() => setIsDeleteAccountModalOpen(true)}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 z-10 bg-[#FAFAF7]">
        <BottomNav />
      </div>

      {/* Modals */}
      <EditNameModal
        isOpen={isEditNameModalOpen}
        onClose={() => setIsEditNameModalOpen(false)}
        currentName={profile?.name || ''}
        onNameUpdated={handleNameUpdated}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onPasswordChanged={handlePasswordChanged}
      />

      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        onAccountDeleted={handleAccountDeleted}
      />
    </div>
  );
}
