
import React, { createContext, useContext, useEffect, useState } from "react";
import { Device } from "@capacitor/device";
import { Capacitor } from "@capacitor/core";

interface DeviceContextProps {
  deviceId: string | null;
  isNative: boolean;
  platform: string;
}

const DeviceContext = createContext<DeviceContextProps | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState('web');

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        // Detectar si estamos en un dispositivo nativo
        const isNativeApp = Capacitor.isNativePlatform();
        setIsNative(isNativeApp);
        setPlatform(Capacitor.getPlatform());
        
        console.log(`📱 Plataforma detectada: ${Capacitor.getPlatform()}, Nativo: ${isNativeApp}`);
        
        const info = await Device.getId();
        setDeviceId(info.identifier); // único por dispositivo
        
        console.log(`🔑 Device ID obtenido: ${info.identifier}`);
      } catch (err) {
        console.error("Error al obtener información del dispositivo:", err);
        // Fallback para web
        const fallbackId = localStorage.getItem('device_id') || `web-${Date.now()}`;
        localStorage.setItem('device_id', fallbackId);
        setDeviceId(fallbackId);
      }
    };

    fetchDeviceInfo();
  }, []);

  return (
    <DeviceContext.Provider value={{ deviceId, isNative, platform }}>
      {children}
    </DeviceContext.Provider>
  );
};

// Hook para usar el contexto fácilmente
export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error("useDevice debe usarse dentro de un DeviceProvider");
  }
  return context;
};
