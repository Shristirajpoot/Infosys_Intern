import React, { useState, useEffect, useRef } from 'react';
import { Edit, Save, X, Camera, Moon, Sun } from 'lucide-react';
import { volunteerAPI, ngoAPI, adminAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';
import Navbar from '../components/Navbar';
import Side from '../components/Side';

const MyProfile = () => {
  const { user, updateUser, fetchUserProfile } = useUser();
  const [activeTab, setActiveTab] = useState('view');
  const [profile, setProfile] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [enlargedImage, setEnlargedImage] = useState(null);
  // Editable field states (start empty so inputs show placeholders)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  // Original (persisted) values
  const [originalName, setOriginalName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [originalLocation, setOriginalLocation] = useState('');
  const [originalBio, setOriginalBio] = useState('');
  const [originalSkills, setOriginalSkills] = useState([]);
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [emailOtp, setEmailOtp] = useState(['','','','']);
  const [emailOtpError, setEmailOtpError] = useState('');
  const emailOtpRefs = useRef([]);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const resendTimerRef = useRef(null);
  // Inline (pre-modal) email change error
  const [emailChangeError, setEmailChangeError] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState(''); // comma separated (edited)
  const [loading, setLoading] = useState(false);
  const [bannerImage, setBannerImage] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const bannerInputRef = useRef(null);

  // Helper to safely extract an image URL from various possible backend field names
  const getOpportunityImage = (opp) => {
    if (!opp) return '';
    // Direct fields
    const direct = opp.imageUrl || opp.image || opp.photo || opp.bannerImage || opp.thumbnail;
    if (direct) return direct;
    // Nested opportunity object (e.g., application.opportunity.imageUrl)
    if (opp.opportunity) {
      const nested = opp.opportunity.imageUrl || opp.opportunity.image || opp.opportunity.photo || opp.opportunity.bannerImage || opp.opportunity.thumbnail;
      if (nested) return nested;
    }
    return '';
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch profile first - use appropriate API based on user role
        try {
          let profRes;
          const userRole = user?.role || 'volunteer';
          
          if (userRole === 'volunteer') {
            profRes = await volunteerAPI.getProfile();
          } else if (userRole === 'ngo') {
            profRes = await ngoAPI.getProfile();
          } else if (userRole === 'admin') {
            profRes = await adminAPI.getProfile();
          } else {
            // Fallback to volunteer API
            profRes = await volunteerAPI.getProfile();
          }
          
          const profileData = profRes.data || {};
          setProfile(profileData);
          // Store originals
          setOriginalName(profileData.name || '');
          setOriginalEmail(profileData.email || '');
          setOriginalLocation(profileData.location || '');
          setOriginalBio(profileData.bio || '');
          setOriginalSkills(Array.isArray(profileData.skills) ? profileData.skills : []);
          if (profileData.profileImage) setProfileImage(profileData.profileImage);
          if (profileData.bannerImage) setBannerImage(profileData.bannerImage);
        } catch (err) { 
          console.error('Error fetching profile:', err);
          // Use user from context as fallback
          if (user) {
            setProfile(user);
            setOriginalName(user.name || '');
            setOriginalEmail(user.email || '');
            setOriginalLocation(user.location || '');
            setOriginalBio(user.bio || '');
            setOriginalSkills(Array.isArray(user.skills) ? user.skills : []);
            if (user.profileImage) setProfileImage(user.profileImage);
            if (user.bannerImage) setBannerImage(user.bannerImage);
          }
        }
        
        // Fetch applications (My Opportunities)
        try {
          const apps = await volunteerAPI.getMyApplications();
          console.log('My applications:', apps);
          console.log('Sample application structure:', apps.data?.[0] || apps[0]);
          setOpportunities(apps.data || apps || []);
        } catch (err) {
          console.error('Failed to fetch applications:', err);
          setOpportunities([]);
        }
      } catch (e) {
        const fallback = { name: 'John Doe', email: 'johndoe@example.com' };
        setProfile(fallback);
        setFullName(fallback.name);
        setEmail(fallback.email);
      }
    }
    fetchData();
  }, [user]);

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBannerImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const openBannerPicker = () => {
    if (activeTab === 'edit') bannerInputRef.current?.click();
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 400; // px constraint for square dimension
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round(height * (maxSize / width));
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round(width * (maxSize / height));
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const compressed = canvas.toDataURL('image/jpeg', 0.7); // compress
          setProfileImage(compressed);
        } catch (err) {
          // fallback to original
          setProfileImage(ev.target.result);
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const parsedSkillsEdited = skills.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        name: fullName || originalName,
        email: originalEmail, // locked until verified
        location: location || originalLocation,
        bio: bio || originalBio,
        skills: parsedSkillsEdited.length ? parsedSkillsEdited : originalSkills,
        profileImage,
        bannerImage
      };
      
      // Use appropriate API based on user role
      let updated;
      const userRole = user?.role || 'volunteer';
      
      if (userRole === 'volunteer') {
        updated = await volunteerAPI.updateProfile(payload);
      } else if (userRole === 'ngo') {
        updated = await ngoAPI.updateProfile(payload);
      } else if (userRole === 'admin') {
        updated = await adminAPI.updateProfile(payload);
      } else {
        // Fallback to volunteer API
        updated = await volunteerAPI.updateProfile(payload);
      }
      
      const data = updated.data || updated; // support possible wrapper
      setProfile(data);
      setActiveTab('view');
      
      // Update UserContext with new profile data
      updateUser(data);
      
      // Refresh originals from saved data if edits applied
      setOriginalName(data.name || originalName);
      setOriginalLocation(data.location || originalLocation);
      setOriginalBio(data.bio || originalBio);
      setOriginalSkills(Array.isArray(data.skills) ? data.skills : originalSkills);
      // Sync banner image from server response (if any)
      if (typeof data.bannerImage === 'string') {
        setBannerImage(data.bannerImage);
      }
    } catch (e) {
      console.error('Error updating profile:', e);
      // silent fail UI already shows edit state
    } finally {
      setLoading(false);
    }
  };

  const initiateEmailVerification = async () => {
    const candidate = email.trim();
    // Reset previous errors
    setEmailChangeError('');
    setEmailOtpError('');
    if(!candidate){ setEmailChangeError('Enter an email first'); return; }
    const valid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate);
    if(!valid){ setEmailChangeError('Enter a valid email'); return; }
    if(candidate.toLowerCase() === originalEmail.toLowerCase()){
      setEmailChangeError('This is already your current email.');
      return;
    }
    setEmailVerifying(true);
    try {
      const r = await volunteerAPI.initiateEmailChange(candidate);
      if(r.success && r.message === 'Email unchanged'){
        setEmailChangeError('Email already current.');
      } else if(r.success){
        setShowEmailOtpModal(true);
        setEmailOtp(['','','','']);
        setResendCooldown(30);
        if(resendTimerRef.current) clearInterval(resendTimerRef.current);
        resendTimerRef.current = setInterval(()=>{
          setResendCooldown(c=>{
            if(c<=1){ clearInterval(resendTimerRef.current); return 0;} return c-1;
          });
        },1000);
      } else {
        setEmailChangeError(r.message || 'Failed to send OTP');
      }
    } catch(err){
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Failed to start email change';
      if(status===409){
        setEmailChangeError('That email is already used by another account.');
      } else {
        setEmailChangeError(msg);
      }
    } finally {
      setEmailVerifying(false);
    }
  };

  const handleEmailOtpChange = (val, idx) => {
    if(!/^[0-9]?$/.test(val)) return;
    const arr=[...emailOtp]; arr[idx]=val; setEmailOtp(arr);
    if(val && idx<3) emailOtpRefs.current[idx+1]?.focus();
  };
  const submitEmailOtp = async () => {
    if(emailOtp.some(d=>!d)) { setEmailOtpError('Enter all 4 digits'); return; }
    try {
      await volunteerAPI.verifyEmailChange(emailOtp.join(''));
      setOriginalEmail(email);
      setShowEmailOtpModal(false);
      setEmailOtp(['','','','']);
      setEmailOtpError('');
      setActiveTab('view');
    } catch(err){
      setEmailOtpError(err.response?.data?.message||'Invalid OTP');
    }
  };
  const resendEmailOtp = async () => {
    if(resendCooldown>0) return;
    try {
      await volunteerAPI.resendEmailChangeOtp();
      setEmailOtpError('');
      setResendCooldown(30);
    } catch(err){
      setEmailOtpError(err.response?.data?.message||'Failed to resend');
    }
  };

  // View mode profile card (unchanged appearance)
  const ProfileCard = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-6 pt-24 pb-8 text-center shadow-sm flex flex-col relative" style={{ minHeight: 460 }}>
      <div
        className="absolute left-1/2 -translate-x-1/2 -top-20 w-40 h-40 rounded-full border-4 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 bg-cover bg-center"
        style={{ backgroundImage: profileImage ? `url(${profileImage})` : 'none' }}
      />
      <h2 className="font-semibold underline text-gray-900 dark:text-gray-100 text-base mb-4 mt-2">{profile?.name || fullName || 'John Doe'}</h2>
      <p className="text-gray-500 dark:text-gray-400 text-xs mb-4 break-all">{email || originalEmail || 'email@example.com'}</p>
      <div className="w-full border-t border-gray-200 dark:border-gray-700 mb-4 mt-auto" />
      <div className="text-[11px] tracking-wide text-gray-400 dark:text-gray-500">Joined Since - 2025</div>
    </div>
  );

  // Live preview card shown during edit (read-only, professional styling)
  const EditPreviewCard = () => {
    const skillList = skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-6 pt-24 pb-6 shadow-sm flex flex-col relative" aria-label="Live profile preview" style={{ minHeight: 460 }}>
        {/* Avatar (non-interactive) positioned identically */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-20 w-40 h-40 rounded-full border-4 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 bg-cover bg-center group/avatar cursor-pointer"
          style={{ backgroundImage: profileImage ? `url(${profileImage})` : 'none' }}
          onClick={() => document.getElementById('profileInput')?.click()}
          aria-label="Change profile picture"
        >
          <div className="absolute inset-0 rounded-full bg-black/0 group-hover/avatar:bg-black/40 flex items-center justify-center transition-colors">
            <Camera className="w-6 h-6 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
          </div>
        </div>
        {/* Preview badge */}
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-2 mt-2 truncate">{fullName || originalName || 'Full Name'}</h2>
        {/* Show edited email only AFTER user types; otherwise blank */}
        <p className="text-gray-500 dark:text-gray-400 text-[11px] mb-3 break-all">{email ? email : originalEmail || ''}</p>
        <div className="space-y-3 text-left text-xs text-gray-600 dark:text-gray-300">
          {location && (
            <div>
              <p className="font-semibold text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Location</p>
              <p className="text-gray-700 dark:text-gray-300 text-[12px]">{location}</p>
            </div>
          )}
          {skillList.length > 0 && (
            <div>
              <p className="font-semibold text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {skillList.map((sk, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[10px] font-medium border border-gray-200 dark:border-gray-600">{sk}</span>
                ))}
              </div>
            </div>
          )}
          {bio && (
            <div>
              <p className="font-semibold text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Bio</p>
              <div className="text-[12px] leading-relaxed max-h-28 overflow-auto pr-1 custom-scrollbar">
                {bio}
              </div>
            </div>
          )}
        </div>
        <div className="mt-auto pt-4">
          <div className="w-full border-t border-gray-200 dark:border-gray-700 mb-3" />
          <div className="text-[11px] tracking-wide text-gray-400 dark:text-gray-500 text-center">Joined Since - 2025</div>
        </div>
      </div>
    );
  };

  const renderViewProfile = () => (
    <div className="">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">My Opportunities</h3>
      {opportunities.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">No opportunities yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.slice(0, visibleCount).map((application, idx) => {
              // Handle both application object and direct opportunity object
              const opp = application.opportunityId || application.opportunity || application;
              const category = opp.category || 'General';
              const date = opp.date ? new Date(opp.date).toLocaleDateString() : 'Date not available';
              const imageUrl = getOpportunityImage(opp);
              const applicationStatus = application.status || 'pending';
              
              return (
                <div
                  key={application._id || idx}
                  className="group border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                >
                  {/* Header image / placeholder */}
                  <div className={`h-40 relative flex items-center justify-center ${imageUrl ? '' : 'bg-emerald-100 dark:bg-emerald-900/50'}`}>
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={opp.title || 'Opportunity'}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setEnlargedImage(imageUrl)}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.classList.add('bg-emerald-100', 'dark:bg-emerald-900/50');
                        }}
                      />
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <p className="text-sm">No Image</p>
                      </div>
                    )}
                  </div>
                  {/* Body */}
                  <div className="px-4 pt-4 pb-3 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug mb-1 line-clamp-2">{opp.title || 'Opportunity Title'}</h4>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-[10px] tracking-wide">{category}</span>
                        <span className="text-gray-400">{date}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] tracking-wide ${
                          applicationStatus === 'accepted' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300' :
                          applicationStatus === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-300'
                        }`}>
                          {applicationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-3">{opp.description || 'Description not available.'}</p>
                    </div>
                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex items-center space-x-2">
                        {opp.createdBy?.profileImage ? (
                          <img 
                            src={opp.createdBy.profileImage} 
                            alt={opp.createdBy.name || 'NGO'}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center ${opp.createdBy?.profileImage ? 'hidden' : ''}`}
                        >
                          <span className="text-green-600 dark:text-green-300 text-xs font-semibold">
                            {(opp.createdBy?.name || 'NGO').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                            {opp.createdBy?.name || 'Unknown NGO'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedOpportunity(application)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium"
                      >
                        View More
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {visibleCount < opportunities.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setVisibleCount((c) => c + 4)}
                className="px-5 py-2 rounded-md bg-emerald-100 dark:bg-emerald-900 text-green-700 dark:text-emerald-300 text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {selectedOpportunity && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOpportunity(null);
          }}
        >
          <div className="mt-10 w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden relative">
            {/* Close */}
            <button
              onClick={() => setSelectedOpportunity(null)}
              className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            {/* Image area */}
            {(() => {
              const application = selectedOpportunity;
              const opp = application.opportunityId || application.opportunity || application;
              const modalImg = getOpportunityImage(opp);
              return (
                <div className={`h-56 relative flex items-center justify-center ${modalImg ? '' : 'bg-emerald-100 dark:bg-emerald-900/50'}`}>
                  {modalImg ? (
                    <img 
                      src={modalImg} 
                      alt={opp.title || 'Opportunity'}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setEnlargedImage(modalImg)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('bg-emerald-100', 'dark:bg-emerald-900/50');
                      }}
                    />
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <p className="text-sm">No Image Available</p>
                    </div>
                  )}
                </div>
              );
            })()}
            <div className="p-6 pt-5">
              {(() => {
                const application = selectedOpportunity;
                const opp = application.opportunityId || application.opportunity || application;
                const applicationStatus = application.status || 'pending';
                const applicationDate = application.createdAt ? new Date(application.createdAt).toLocaleDateString() : '';
                const eventDate = opp.date ? new Date(opp.date).toLocaleDateString() : '';
                
                return (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{opp.title || 'Opportunity Title'}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{opp.location || 'Location not specified'}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4 flex-wrap">
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-[11px] tracking-wide">
                        {opp.category || 'General'}
                      </span>
                      {eventDate && <span>Event: {eventDate}</span>}
                      {applicationDate && <span>Applied: {applicationDate}</span>}
                      <span className={`px-2 py-0.5 rounded text-[11px] tracking-wide ${
                        applicationStatus === 'accepted' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300' :
                        applicationStatus === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300' :
                        'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-300'
                      }`}>
                        Status: {applicationStatus}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 mb-4">
                      {opp.description || 'No description available.'}
                    </p>
                    {application.applicationMessage && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Your Application Message:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{application.applicationMessage}</p>
                      </div>
                    )}
                    {application.reviewMessage && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Review Note:</p>
                        <p className="text-sm text-blue-600 dark:text-blue-200">{application.reviewMessage}</p>
                      </div>
                    )}
                  </>
                );
              })()}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const application = selectedOpportunity;
                    const opp = application.opportunityId || application.opportunity || application;
                    
                    return (
                      <>
                        {opp.createdBy?.profileImage ? (
                          <img 
                            src={opp.createdBy.profileImage} 
                            alt={opp.createdBy.name || 'NGO'}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center ${opp.createdBy?.profileImage ? 'hidden' : ''}`}
                        >
                          <span className="text-green-600 dark:text-green-300 text-sm font-semibold">
                            {(opp.createdBy?.name || 'NGO').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {opp.createdBy?.name || 'Unknown NGO'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Organizer</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={() => setSelectedOpportunity(null)}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium"
                >Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEditProfile = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Edit Profile</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Manage your account information and settings.</p>
      <div className="space-y-6 max-w-5xl">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Profile Picture</label>
          <div className="flex items-center gap-4">
            <div
              className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-600 bg-gray-300 dark:bg-gray-600 bg-cover bg-center flex-shrink-0"
              style={{ backgroundImage: profileImage ? `url(${profileImage})` : 'none' }}
            >
              {!profileImage && (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <Camera className="w-8 h-8" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => document.getElementById('profileInput')?.click()}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              {profileImage ? 'Change Photo' : 'Upload Photo'}
            </button>
            {profileImage && (
              <button
                type="button"
                onClick={() => setProfileImage('')}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded text-sm font-medium transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">Recommended: Square image, at least 400x400px</p>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Full Name</label>
          <input type="text" className="w-full border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:placeholder-gray-400" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder='John Doe' />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Email</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e)=> setEmail(e.target.value)}
              className="flex-1 border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:placeholder-gray-400"
              placeholder={'johndoe@example.com'}
            />
            {email && email !== originalEmail && (
              <button
                type="button"
                onClick={initiateEmailVerification}
                disabled={emailVerifying}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded text-xs font-medium whitespace-nowrap"
              >{emailVerifying? 'Sending...' : 'Verify'}</button>
            )}
          </div>
            {email && email!==originalEmail && !emailChangeError && (
              <p className="text-xs mt-1 text-amber-600 dark:text-amber-500">New email pending verification.</p>
            )}
            {emailChangeError && (
              <p className="text-xs mt-1 text-red-600 dark:text-red-500">{emailChangeError}</p>
            )}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Location</label>
          <input type="text" className="w-full border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:placeholder-gray-400" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={originalLocation || 'City, Country'} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Skills (comma separated)</label>
          <input type="text" className="w-full border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:placeholder-gray-400" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder={(originalSkills && originalSkills.length ? originalSkills.join(', ') : 'Recycling, First Aid, Coordination')} />
          <p className="text-xs text-gray-400 mt-1">Separate each skill with a comma.</p>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Bio</label>
          <textarea className="w-full border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm h-40 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 dark:placeholder-gray-400" value={bio} onChange={(e) => setBio(e.target.value)} placeholder={originalBio || 'Tell us about your volunteering interests'} maxLength={400} />
          <div className="text-right text-[11px] text-gray-400 mt-1">{(bio || '').length}/400</div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={loading} className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2">
            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={() => setActiveTab('view')} className="px-5 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-2">
            <X className="w-4 h-4" /> Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Side />
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900">
          <div
            className={`h-40 md:h-56 w-full relative ${activeTab === 'edit' ? 'cursor-pointer group' : ''}`}
            onClick={openBannerPicker}
            style={{
              backgroundImage: bannerImage ? `url(${bannerImage})` : 'linear-gradient(to right,#255037,#1f4430,#183628)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            role={activeTab === 'edit' ? 'button' : undefined}
            aria-label={activeTab === 'edit' ? 'Change banner image' : 'Profile banner'}
          >
            {activeTab === 'edit' && (
              <div className="absolute inset-0 flex items-center justify-center transition-colors duration-200 bg-black/0 group-hover:bg-black/40">
                <span className="flex items-center gap-2 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit className="w-4 h-4" /> Change Banner
                </span>
              </div>
            )}
          </div>
          <div className="relative">
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-28 lg:-mt-32 flex flex-col lg:flex-row gap-6 lg:gap-10`}>
              {/* Mobile Profile Card / Preview (stacked) */}
              <div className="lg:hidden">
                {activeTab === 'view' ? <ProfileCard /> : <EditPreviewCard />}
              </div>
              <div className="flex-1 pt-8 md:pt-16 lg:pt-40 pb-16">
                <div className="mb-4">
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">My Profile</h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">Manage your account information and settings.</p>
                  <div className="flex bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden w-fit mb-4">
                    <button
                      className={`px-4 py-2 text-sm font-medium transition-colors rounded-full ${activeTab === 'view' ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                      onClick={() => setActiveTab('view')}
                    >View Profile</button>
                    <button
                      className={`px-4 py-2 text-sm font-medium transition-colors rounded-full ${activeTab === 'edit' ? 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                      onClick={() => setActiveTab('edit')}
                    >Edit Profile</button>
                  </div>
                </div>
                {activeTab === 'view' ? renderViewProfile() : renderEditProfile()}
              </div>
              {activeTab === 'view' && (
                <div className="hidden lg:block w-80 flex-shrink-0 self-start sticky top-36">
                  {/* Sticky profile card (desktop) */}
                  <ProfileCard />
                </div>
              )}
              {activeTab === 'edit' && (
                <div className="hidden lg:block w-80 flex-shrink-0 self-start sticky top-36">
                  {/* Sticky live preview card (desktop) */}
                  <EditPreviewCard />
                </div>
              )}
              {showEmailOtpModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md relative overflow-hidden">
                    <button
                      onClick={()=>{setShowEmailOtpModal(false); setEmail(originalEmail);}}
                      className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="px-6 pt-6 pb-5">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Verify your new email</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">We've sent a 4-digit code to <span className="font-medium text-gray-700 dark:text-gray-200">{email}</span>. Enter it below to confirm the change.</p>
                      {emailOtpError && <div className="mb-3 text-xs bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-3 py-2 rounded">{emailOtpError}</div>}
                      <div className="flex justify-center gap-3 mb-5">
                        {emailOtp.map((d,i)=>(
                          <input
                            key={i}
                            value={d}
                            maxLength={1}
                            ref={el=>emailOtpRefs.current[i]=el}
                            onChange={e=>handleEmailOtpChange(e.target.value,i)}
                            className="w-14 h-14 text-center text-xl font-semibold border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between mb-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>OTP expires in 5 minutes</span>
                        <button
                          type="button"
                          disabled={resendCooldown>0}
                          onClick={resendEmailOtp}
                          className={`font-medium ${resendCooldown>0? 'text-gray-400 cursor-not-allowed':'text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400'}`}
                        >{resendCooldown>0? `Resend in ${resendCooldown}s`:'Resend Code'}</button>
                      </div>
                      <div className="flex gap-3">
                        <button
                          disabled={emailOtp.some(d=>!d)}
                          onClick={submitEmailOtp}
                          className="flex-1 py-2.5 rounded-md bg-emerald-600 disabled:opacity-50 text-white font-medium hover:bg-emerald-700 transition-colors"
                        >Verify & Update</button>
                        <button
                          onClick={()=>{setShowEmailOtpModal(false); setEmail(originalEmail);}}
                          className="px-4 py-2.5 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-300 dark:hover:bg-gray-500"
                        >Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <input ref={bannerInputRef} id="bannerInput" type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
          <input id="profileInput" type="file" accept="image/*" onChange={handleProfileUpload} className="hidden" />
        </div>
      </div>
      
      {/* Image Enlargement Modal */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={enlargedImage} 
              alt="Enlarged view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-4 -right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
