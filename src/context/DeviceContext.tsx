
import React, { createContext, useContext, useEffect, useState } from "react";
import { Device } from "@capacitor/device";

interface DeviceContextProps {
  deviceId: string | null;
}

const DeviceContext = createContext<DeviceContextProps | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeviceId = async () => {
      try {
        const info = await Device.getId();
        setDeviceId(info.identifier); // único por dispositivo
      } catch (err) {
        console.error("Error al obtener el deviceId:", err);
      }
    };

    fetchDeviceId();
  }, []);

  return (
    <DeviceContext.Provider value={{ deviceId }}>
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
