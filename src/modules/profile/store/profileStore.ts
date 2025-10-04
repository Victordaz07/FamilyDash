import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FamilyMember, FamilyHouse, HouseInvitationCode, ProfileData, ROLE_PERMISSIONS } from '../types';
// 🔥 FIREBASE REAL SERVICES ACTIVATED
import { RealDatabaseService, RealAuthService, RealStorageService, trackEvent } from '../../../services';

interface ProfileState {
    // Current user profile
    currentUser: FamilyMember | null;
    userProfile: ProfileData | null;

    // Family house data
    familyHouse: FamilyHouse | null;

    // Actions
    setCurrentUser: (user: FamilyMember | null) => void;
    setFamilyHouse: (house: FamilyHouse | null) => void;

    // Member management
    addMember: (member: Omit<FamilyMember, 'id' | 'joinedAt'>) => Promise<void>;
    removeMember: (memberId: string) => Promise<void>;
    updateMember: (memberId: string, updates: Partial<FamilyMember>) => Promise<void>;
    transferAdmin: (newAdminId: string) => Promise<void>;

    // Invitation management
    createInvitationCode: () => Promise<HouseInvitationCode>;
    useInvitationCode: (code: string, newMember: Omit<FamilyMember, 'id' | 'joinedAt' | 'code'>) => Promise<FamilyMember | null>;
    getPendingInvitations: () => HouseInvitationCode[];

    // Profile management
    updateProfile: (profileData: Partial<ProfileData>) => Promise<void>;
    updateAvatar: (avatar: string) => Promise<void>;

    // Permission checks
    hasPermission: (scope: string, action: string) => boolean;
    isAdmin: () => boolean;
    isSubAdmin: () => boolean;
    isChild: () => boolean;

    // House management
    createHouse: (houseName: string, admin: FamilyMember) => Promise<void>;
    leaveHouse: () => Promise<void>;

    // Utilities
    generateUniqueId: () => string;
    generateInvitationCode: () => string;
}

// Empty state - No mock data, ready for real connections
const emptyFamilyHouse: FamilyHouse | null = null;

export const useProfileStore = create<ProfileState>()(
    persist(
        (set, get) => ({
            // Initial state - Empty, ready for real connections
            currentUser: null,
            userProfile: null,
            familyHouse: emptyFamilyHouse,

            // Basic setters
            setCurrentUser: (user) => set({ currentUser: user }),
            setFamilyHouse: (house) => set({ familyHouse: house }),

            // Member management
            addMember: async (memberData) => {
                const { familyHouse } = get();
                if (!familyHouse) return;

                const newMember: FamilyMember = {
                    ...memberData,
                    id: get().generateUniqueId(),
                    joinedAt: new Date(),
                    permissions: ROLE_PERMISSIONS[memberData.role].map(p => `${p.scope}:${p.action}`),
                };

                const updatedHouse = {
                    ...familyHouse,
                    members: [...familyHouse.members, newMember],
                };

                set({ familyHouse: updatedHouse });
                console.log('New member added:', newMember.name);
            },

            removeMember: async (memberId) => {
                const { familyHouse, currentUser } = get();
                if (!familyHouse || !currentUser) return;

                // Check if user is admin or sub-admin
                if (!['admin', 'sub-admin'].includes(currentUser.role)) {
                    throw new Error('Insufficient permissions to remove members');
                }

                // Cannot remove admin
                if (familyHouse.adminId === memberId && currentUser.id !== memberId) {
                    throw new Error('Cannot remove the main administrator');
                }

                const updatedMembers = familyHouse.members.map(member =>
                    member.id === memberId
                        ? { ...member, isActive: false, leftAt: new Date() }
                        : member
                );

                const updatedHouse = {
                    ...familyHouse,
                    members: updatedMembers,
                };

                set({ familyHouse: updatedHouse });
                console.log('Member removed:', memberId);
            },

            updateMember: async (memberId, updates) => {
                const { familyHouse } = get();
                if (!familyHouse) return;

                const updatedMembers = familyHouse.members.map(member =>
                    member.id === memberId
                        ? { ...member, ...updates }
                        : member
                );

                set({
                    familyHouse: { ...familyHouse, members: updatedMembers },
                    currentUser: memberId === get().currentUser?.id ? { ...get().currentUser!, ...updates } : get().currentUser,
                });
            },

            transferAdmin: async (newAdminId) => {
                const { familyHouse, currentUser } = get();
                if (!familyHouse || !currentUser || currentUser.role !== 'admin') {
                    throw new Error('Only admins can transfer administration');
                }

                const updatedMembers = familyHouse.members.map(member =>
                    member.id === newAdminId
                        ? { ...member, role: 'admin' as const, permissions: ROLE_PERMISSIONS.admin.map(p => `${p.scope}:${p.action}`) }
                        : member
                );

                const updatedHouse = {
                    ...familyHouse,
                    adminId: newAdminId,
                    subAdminId: familyHouse.adminId, // Current admin becomes sub-admin
                    members: updatedMembers,
                };

                // Update current user if they're the one transferring
                const updatedCurrentUser = get().currentUser?.id === currentUser.id
                    ? { ...currentUser, role: 'sub-admin' as const, permissions: ROLE_PERMISSIONS['sub-admin'].map(p => `${p.scope}:${p.action}`) }
                    : get().currentUser;

                set({ familyHouse: updatedHouse, currentUser: updatedCurrentUser });
                console.log('Admin role transferred to:', newAdminId);
            },

            // Invitation management
            createInvitationCode: async () => {
                const { familyHouse, currentUser } = get();
                if (!familyHouse || !currentUser || !['admin', 'sub-admin'].includes(currentUser.role)) {
                    throw new Error('Insufficient permissions to create invitations');
                }

                const invitationCode: HouseInvitationCode = {
                    code: get().generateInvitationCode(),
                    createdBy: currentUser.id,
                    createdAt: new Date(),
                    expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                    isUsed: false,
                };

                const updatedHouse = {
                    ...familyHouse,
                    invitationCodes: [...(familyHouse.invitationCodes || []), invitationCode],
                };

                set({ familyHouse: updatedHouse });
                console.log('Invitation code created:', invitationCode.code);
                return invitationCode;
            },

            useInvitationCode: async (code, newMemberData) => {
                const { familyHouse } = get();
                if (!familyHouse) return null;

                const invitation = familyHouse.invitationCodes.find(inv => inv.code === code && !inv.isUsed);
                if (!invitation) {
                    throw new Error('Invalid or expired invitation code');
                }

                const generatedCode = `RUZ${String(Math.floor(Math.random() * 9000) + 1000)}`;
                const newMember: FamilyMember = {
                    ...newMemberData,
                    id: get().generateUniqueId(),
                    code: generatedCode,
                    joinedAt: new Date(),
                    permissions: ROLE_PERMISSIONS[newMemberData.role].map(p => `${p.scope}:${p.action}`),
                };

                const updatedMembers = familyHouse.members.map(member =>
                    member.id === invitation.createdBy
                        ? { ...member, role: 'sub-admin' as const }
                        : member
                );

                // Mark invitation as used
                const updatedInvitations = familyHouse.invitationCodes.map(inv =>
                    inv.code === code
                        ? { ...inv, isUsed: true, usedBy: newMember.id, usedAt: new Date() }
                        : inv
                );

                const updatedHouse = {
                    ...familyHouse,
                    members: [...updatedMembers, newMember],
                    invitationCodes: updatedInvitations,
                };

                set({ familyHouse: updatedHouse });
                console.log('New member joined via invitation:', newMember.name);
                return newMember;
            },

            getPendingInvitations: () => {
                const { familyHouse } = get();
                if (!familyHouse) return [];

                return familyHouse.invitationCodes.filter(inv => !inv.isUsed);
            },

      // Profile management 🔥 FIREBASE ACTIVATED
      updateProfile: async (profileData) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;

        try {
          console.log('🔥 Firebase Profile update:', profileData);
          
          // Update via Firebase Firestore
          const firebaseUser = RealAuthService.getCurrentUser();
          if (firebaseUser) {
            // Update user profile in Firebase
            await RealDatabaseService.updateDocument(
              `users/${firebaseUser.uid}/profile`,
              {
                ...profileData,
                updatedAt: new Date(),
              }
            );

            // Update family member data if part of a family
            if (get().familyHouse) {
              await RealDatabaseService.updateDocument(
                `families/${firebaseUser.uid}/members/${currentUser.id}`,
                {
                  ...profileData,
                  updatedAt: new Date(),
                }
              );
            }

            console.log('✅ Profile updated successfully in Firebase');
            
            // Track analytics event
            trackEvent('profile_updated', {
              userId: firebaseUser.uid,
              fields: Object.keys(profileData),
              timestamp: new Date().toISOString()
            });
          } else {
            console.log('⚠️ No Firebase user authenticated, using local update');
          }

          // Update local state
          await get().updateMember(currentUser.id, profileData);
          
          set({
            userProfile: profileData as ProfileData,
          });

        } catch (error) {
          console.error('❌ Error updating profile in Firebase:', error);
          
          // Fallback to local update
          await get().updateMember(currentUser.id, profileData);
          
          set({
            userProfile: profileData as ProfileData,
          });
        }
      },
      
      updateAvatar: async (avatar) => {
        await get().updateProfile({ avatar });
      },

      // New enhanced profile functions
      updateNickname: async (nickname: string) => {
        await get().updateProfile({ nickname });
      },

      updateProfileImage: async (profileImageUrl: string) => {
        await get().updateProfile({ profileImage: profileImageUrl });
      },

      updateBio: async (bio: string) => {
        await get().updateProfile({ bio });
      },

      updatePhone: async (phone: string) => {
        await get().updateProfile({ phone });
      },

      updateBirthday: async (birthday: Date) => {
        await get().updateProfile({ birthday });
      },

      updatePreferences: async (preferences: Partial<FamilyMember['preferences']>) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;

        const updatedPreferences = {
          ...currentUser.preferences,
          ...preferences,
        };

        await get().updateProfile({ preferences: updatedPreferences });
      },

      // Complete profile update
      updateCompleteProfile: async (profileUpdates: Partial<FamilyMember>) => {
        await get().updateProfile(profileUpdates);
      },

            // Permission checks
            hasPermission: (scope: string, action: string) => {
                const { currentUser } = get();
                if (!currentUser) return false;

                const permission = `${scope}:${action}`;
                return currentUser.permissions.includes(permission);
            },

            isAdmin: () => {
                const { currentUser } = get();
                return currentUser?.role === 'admin';
            },

            isSubAdmin: () => {
                const { currentUser } = get();
                return currentUser?.role === 'sub-admin';
            },

            isChild: () => {
                const { currentUser } = get();
                return currentUser?.role === 'child';
            },

            // House management 🔥 FIREBASE ACTIVATED
            createHouse: async (houseName: string, admin: FamilyMember) => {
                try {
                    console.log('🔥 Creating house in Firebase:', houseName);
                    
                    const newHouse: FamilyHouse = {
                        houseId: get().generateUniqueId(),
                        houseName,
                        adminId: admin.id,
                        members: [admin],
                        createdAt: new Date(),
                        invitationCodes: [],
                    };

                    // Create house in Firebase Firestore
                    const firebaseUser = RealAuthService.getCurrentUser();
                    if (firebaseUser) {
                        // Create house document
                        await RealDatabaseService.updateDocument(
                            `families/${firebaseUser.uid}`,
                            {
                                ...newHouse,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            }
                        );

                        // Create member document
                        await RealDatabaseService.updateDocument(
                            `families/${firebaseUser.uid}/members/${admin.id}`,
                            {
                                ...admin,
                                joinedAt: new Date(),
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            }
                        );

                        // Create user profile document
                        await RealDatabaseService.updateDocument(
                            `users/${firebaseUser.uid}/profile`,
                            {
                                ...admin,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            }
                        );

                        console.log('✅ House created successfully in Firebase');

                        // Track analytics
                        trackEvent('house_created', {
                            userId: firebaseUser.uid,
                            houseId: newHouse.houseId,
                            houseName: houseName,
                            memberCount: 1,
                            timestamp: new Date().toISOString()
                        });
                    } else {
                        console.log('⚠️ No Firebase user authenticated, house created locally only');
                    }

                    // Update local state
                    set({
                        familyHouse: newHouse,
                        currentUser: admin,
                    });

                    console.log('✅ New house created successfully:', houseName);

                } catch (error) {
                    console.error('❌ Error creating house in Firebase:', error);
                    
                    // Fallback to local creation
                    const fallbackHouse: FamilyHouse = {
                        houseId: get().generateUniqueId(),
                        houseName,
                        adminId: admin.id,
                        members: [admin],
                        createdAt: new Date(),
                        invitationCodes: [],
                    };
                    
                    set({
                        familyHouse: fallbackHouse,
                        currentUser: admin,
                    });
                    
                    console.log('⚠️ House created locally (Firebase failed):', houseName);
                }
            },

            leaveHouse: async () => {
                const { currentUser } = get();
                if (!currentUser) return;

                await get().removeMember(currentUser.id);

                set({
                    currentUser: null,
                    familyHouse: null,
                });

                console.log('Current user left the house');
            },

            // Utilities
            generateUniqueId: () => {
                return Math.random().toString(36).substr(2, 9);
            },

            generateInvitationCode: () => {
                return Math.random().toString(36).substr(2, 8).toUpperCase();
            },
        }),
        {
            name: 'profile-storage',
            storage: {
                getItem: async (name: string) => {
                    const value = await AsyncStorage.getItem(name);
                    return value ? JSON.parse(value) : null;
                },
                setItem: async (name: string, value: any) => {
                    await AsyncStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: async (name: string) => {
                    await AsyncStorage.removeItem(name);
                },
            },
        }
    )
);
