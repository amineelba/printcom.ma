import { getPayload as getPayloadInstance } from 'payload'
import config from '@payload-config'

/**
 * Cached Payload Local API client for use in Server Components, route
 * handlers and server actions. Avoids re-initializing Payload per request.
 */
export const getPayload = () => getPayloadInstance({ config })
