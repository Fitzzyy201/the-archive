import { Injectable, ServiceUnavailableException, BadRequestException } from '@nestjs/common';

const BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type CachedEntry = { data: unknown; expiresAt: number };

export type Province = { id: string; name: string };
export type Regency = { id: string; provinceId: string; name: string };
export type District = { id: string; regencyId: string; name: string };

@Injectable()
export class WilayahService {
  private readonly cache = new Map<string, CachedEntry>();

  async getProvinces(): Promise<Province[]> {
    const raw = await this.fetchCached<Record<string, unknown>[]>('provinces');
    return raw.map((item) => ({
      id: String(item.id),
      name: String(item.name),
    }));
  }

  async getRegencies(provinceId?: string): Promise<Regency[]> {
    const toRegency = (item: Record<string, unknown>): Regency => ({
      id: String(item.id),
      provinceId: String(item.province_id),
      name: String(item.name),
    });

    if (provinceId) {
      const raw = await this.fetchCached<Record<string, unknown>[]>(
        `regencies/${provinceId}`,
      );
      return raw.map(toRegency);
    }

    const provinces = await this.getProvinces();
    const lists = await Promise.all(
      provinces.map((province) =>
        this.fetchCached<Record<string, unknown>[]>(
          `regencies/${province.id}`,
        ),
      ),
    );
    return lists.flat().map(toRegency);
  }

  async getDistricts(regencyId?: string): Promise<District[]> {
    if (!regencyId) {
      throw new BadRequestException('Parameter regencyId wajib diisi');
    }

    const raw = await this.fetchCached<Record<string, unknown>[]>(
      `districts/${regencyId}`,
    );
    return raw.map((item) => ({
      id: String(item.id),
      regencyId: String(item.regency_id),
      name: String(item.name),
    }));
  }

  private async fetchCached<T>(resource: string): Promise<T> {
    const cached = this.cache.get(resource);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }

    try {
      const res = await fetch(`${BASE_URL}/${resource}.json`);
      if (!res.ok) {
        throw new Error(`Upstream mengembalikan status ${res.status}`);
      }

      const data = (await res.json()) as T;
      this.cache.set(resource, {
        data,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      return data;
    } catch (err) {
      // Pakai cache lama bila masih ada walau sudah lewat TTL
      if (cached) {
        return cached.data as T;
      }
      throw new ServiceUnavailableException(
        'Data wilayah sedang tidak tersedia, coba lagi nanti',
      );
    }
  }
}
