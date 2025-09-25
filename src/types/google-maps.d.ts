// Declaraciones de tipos para Google Maps
declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        Marker: any;
        SymbolPath: any;
        MapTypeId: {
          ROADMAP: string;
          SATELLITE: string;
          HYBRID: string;
          TERRAIN: string;
        };
        Size: new (width: number, height: number) => any;
        Point: new (x: number, y: number) => any;
        Geocoder: new () => any;
        importLibrary?: any;
      };
    };
  }

  namespace google {
    namespace maps {
      interface GeocoderResponse {
        results: any[];
        status: string;
      }
    }
  }
}

export {};