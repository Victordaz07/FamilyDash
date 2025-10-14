import React, { useEffect, useMemo, useState } from "react";
import { Modal, View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getNotificationSettings, saveNotificationSettings } from "@/services/notifications/notificationSettings";
import type { NotificationSettings, NotifChannelKey } from "@/types/notifications";

type Props = {
  visible: boolean;
  onClose: () => void;
  familyId: string;
  userId: string;
  onOpenReminders?: () => void; // navega a tu pantalla de Reminders (ya existente)
  onOpenSounds?: () => void;    // si tienes una pantalla de sonidos; opcional
};

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function NotificationsModal({
  visible, onClose, familyId, userId, onOpenReminders, onOpenSounds,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cfg, setCfg] = useState<NotificationSettings | null>(null);

  const startDate = useMemo(() => strToDate(cfg?.quietHours.start || "22:00"), [cfg?.quietHours.start]);
  const endDate   = useMemo(() => strToDate(cfg?.quietHours.end   || "07:00"), [cfg?.quietHours.end]);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      setLoading(true);
      const s = await getNotificationSettings(familyId, userId);
      setCfg(s);
      setLoading(false);
    })();
  }, [visible, familyId, userId]);

  const toggleMaster = (v: boolean) => setCfg((p) => p ? { ...p, enableAll: v } : p);
  const toggleVibration = (v: boolean) => setCfg((p) => p ? { ...p, vibration: v } : p);
  const toggleSound = (v: boolean) => setCfg((p) => p ? { ...p, sound: v } : p);

  const toggleQuiet = (v: boolean) =>
    setCfg((p) => p ? { ...p, quietHours: { ...p.quietHours, enabled: v } } : p);
  const setQuietStart = (_: any, d?: Date) =>
    d && setCfg((p) => p ? { ...p, quietHours: { ...p.quietHours, start: dateToStr(d) } } : p);
  const setQuietEnd = (_: any, d?: Date) =>
    d && setCfg((p) => p ? { ...p, quietHours: { ...p.quietHours, end: dateToStr(d) } } : p);

  const toggleDayFilter = (v: boolean) =>
    setCfg((p) => p ? { ...p, dayFilters: { ...p.dayFilters, enabled: v } } : p);
  const toggleDay = (i: number) =>
    setCfg((p) => {
      if (!p) return p;
      const allowed = new Set(p.dayFilters.allowedWeekdays);
      allowed.has(i) ? allowed.delete(i) : allowed.add(i);
      return { ...p, dayFilters: { ...p.dayFilters, allowedWeekdays: [...allowed].sort() } };
    });

  const toggleChannel = (key: NotifChannelKey, field: "enabled"|"sound"|"vibration", v: boolean) =>
    setCfg((p) => p ? { ...p, channels: { ...p.channels, [key]: { ...p.channels[key], [field]: v } } } : p);

  const save = async () => {
    if (!cfg) return;
    setSaving(true);
    await saveNotificationSettings(cfg);
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.header}>Notifications</Text>

          {loading || !cfg ? (
            <Text style={{ color: "#6b7280" }}>Loading…</Text>
          ) : (
            <>
              {/* sección principal */}
              <Row title="Push Notifications" subtitle="Receive app notifications">
                <Switch value={!!cfg.enableAll} onValueChange={toggleMaster} />
              </Row>

              <Divider />

              {/* atajos que NO cambian tu módulo de Reminders */}
              <LinkRow title="Reminders" subtitle="Configure notification schedules" onPress={onOpenReminders} />
              <LinkRow title="Sounds" subtitle="Configure notification sounds" onPress={onOpenSounds} />

              <Divider />

              {/* defaults */}
              <SectionTitle>Defaults</SectionTitle>
              <Row title="Sound" subtitle="Default sound on notifications">
                <Switch value={!!cfg.sound} onValueChange={toggleSound} />
              </Row>
              <Row title="Vibration" subtitle="Vibrate on notification">
                <Switch value={!!cfg.vibration} onValueChange={toggleVibration} />
              </Row>

              <Divider />

              {/* quiet hours */}
              <SectionTitle>Quiet hours</SectionTitle>
              <Row title="Enabled" subtitle="Silence notifications during a time window">
                <Switch value={cfg.quietHours.enabled} onValueChange={toggleQuiet} />
              </Row>
              {cfg.quietHours.enabled && (
                <View style={styles.inline}>
                  <TimePicker label="Start" date={startDate} onChange={setQuietStart} />
                  <TimePicker label="End"   date={endDate}   onChange={setQuietEnd} />
                </View>
              )}

              <Divider />

              {/* días permitidos */}
              <SectionTitle>Allowed days</SectionTitle>
              <Row title="Enable day filter" subtitle="Only notify on selected days">
                <Switch value={cfg.dayFilters.enabled} onValueChange={toggleDayFilter} />
              </Row>
              {cfg.dayFilters.enabled && (
                <View style={styles.daysRow}>
                  {DAYS.map((d, i) => {
                    const active = cfg.dayFilters.allowedWeekdays.includes(i);
                    return (
                      <TouchableOpacity key={d} onPress={() => toggleDay(i)} style={[styles.day, active && styles.dayOn]}>
                        <Text style={[styles.dayText, active && styles.dayTextOn]}>{d}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <Divider />

              {/* overrides por canal (no toca Reminders UI) */}
              <SectionTitle>Channels</SectionTitle>
              {([
                { key:"family_schedules", title:"Family Schedules" },
                { key:"upcoming_reminders", title:"Upcoming Reminders" },
              ] as {key: NotifChannelKey; title: string}[]).map(({key,title}) => {
                const ch = cfg.channels[key] || {};
                return (
                  <View key={key} style={styles.channel}>
                    <Text style={styles.channelTitle}>{title}</Text>
                    <Row title="Enabled">
                      <Switch value={ch.enabled !== false} onValueChange={(v)=>toggleChannel(key,"enabled",v)} />
                    </Row>
                    <View style={styles.inline}>
                      <MiniToggle label="Sound" value={ch.sound !== false} onChange={(v)=>toggleChannel(key,"sound",v)} />
                      <MiniToggle label="Vibration" value={ch.vibration !== false} onChange={(v)=>toggleChannel(key,"vibration",v)} />
                    </View>
                  </View>
                );
              })}

              {/* acciones */}
              <View style={styles.footer}>
                <TouchableOpacity onPress={onClose} style={[styles.btn, styles.btnGhost]}>
                  <Text style={styles.btnGhostText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={save} style={[styles.btn, styles.btnPrimary]} disabled={saving}>
                  <Text style={styles.btnText}>{saving ? "Saving…" : "Save"}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const Row = ({ title, subtitle, children }:{ title:string; subtitle?:string; children?:React.ReactNode }) => (
  <View style={styles.row}>
    <View style={{ flex:1 }}>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
    {children}
  </View>
);

const LinkRow = ({ title, subtitle, onPress }:{ title:string; subtitle?:string; onPress?:()=>void }) => (
  <TouchableOpacity onPress={onPress} style={styles.row}>
    <View style={{ flex:1 }}>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
    <Text style={styles.chev}>&#8250;</Text>
  </TouchableOpacity>
);

const Divider = () => <View style={styles.divider} />;
const SectionTitle = ({ children }:{ children:React.ReactNode }) => <Text style={styles.section}>{children}</Text>;

const TimePicker = ({ label, date, onChange }:{ label:string; date:Date; onChange:(e:any,d?:Date)=>void }) => (
  <View style={{ flex:1, alignItems:"center" }}>
    <Text style={styles.smallLabel}>{label}</Text>
    <DateTimePicker mode="time" value={date} onChange={onChange} />
  </View>
);

const MiniToggle = ({ label, value, onChange }:{ label:string; value:boolean; onChange:(v:boolean)=>void }) => (
  <View style={styles.miniToggle}>
    <Text style={styles.miniLabel}>{label}</Text>
    <Switch value={value} onValueChange={onChange} />
  </View>
);

function strToDate(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}
function dateToStr(d: Date) {
  const pad = (n:number)=> String(n).padStart(2,"0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const styles = StyleSheet.create({
  backdrop:{ flex:1, backgroundColor:"#0008", justifyContent:"center", padding:16 },
  sheet:{ backgroundColor:"#fff", borderRadius:16, padding:16, maxHeight:"90%" },
  header:{ fontSize:18, fontWeight:"800", marginBottom:10 },
  row:{ flexDirection:"row", alignItems:"center", gap:12, paddingVertical:10 },
  title:{ fontWeight:"700", color:"#111827" },
  subtitle:{ color:"#6b7280" },
  chev:{ fontSize:22, color:"#9ca3af" },
  divider:{ height:1, backgroundColor:"#e5e7eb", marginVertical:8 },
  section:{ marginTop:6, marginBottom:2, fontWeight:"800", color:"#374151" },
  inline:{ flexDirection:"row", gap:12, justifyContent:"space-between", marginTop:6 },
  daysRow:{ flexDirection:"row", flexWrap:"wrap", gap:8, marginTop:8 },
  day:{ paddingHorizontal:10, paddingVertical:6, borderRadius:10, backgroundColor:"#e5e7eb" },
  dayOn:{ backgroundColor:"#6366f1" },
  dayText:{ color:"#111827", fontWeight:"700" },
  dayTextOn:{ color:"#fff", fontWeight:"800" },
  smallLabel:{ color:"#6b7280", marginBottom:4, fontWeight:"700" },
  channel:{ backgroundColor:"#f9fafb", borderRadius:12, padding:10, marginTop:8 },
  channelTitle:{ fontWeight:"800", marginBottom:4, color:"#111827" },
  miniToggle:{ flexDirection:"row", alignItems:"center", gap:10 },
  miniLabel:{ color:"#374151", fontWeight:"700" },
  footer:{ flexDirection:"row", justifyContent:"flex-end", gap:10, marginTop:12 },
  btn:{ paddingVertical:10, paddingHorizontal:14, borderRadius:12 },
  btnPrimary:{ backgroundColor:"#10b981" },
  btnText:{ color:"#fff", fontWeight:"800" },
  btnGhost:{ backgroundColor:"#eef2ff" },
  btnGhostText:{ color:"#111827", fontWeight:"800" },
});




