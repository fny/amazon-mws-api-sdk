import { AmazonMarketplace } from '@scaleleap/amazon-marketplaces'
import axios from 'axios'
import parser from 'fast-xml-parser'
import { URLSearchParams } from 'url'

import { sign } from './sign'

export interface MWSOptions {
  marketplace: AmazonMarketplace
  awsAccessKeyId: string
  mwsAuthToken: string
  sellerId: string
  secretKey: string
}

type HttpMethod = 'GET' | 'POST'
type Parameters = Record<string, string | string[]>

export enum Resource {
  Sellers = 'Sellers',
}

interface ResourceActions {
  [Resource.Sellers]:
    | 'ListMarketplaceParticipations'
    | 'ListMarketplaceParticipationsByNextToken'
    | 'GetServiceStatus'
}

interface Request {
  url: string
  method: HttpMethod
  headers: Record<string, string>
  data?: string
}

interface ResourceInfo<TResource extends Resource> {
  resource: TResource
  version: string
  action: ResourceActions[TResource]
  parameters: Parameters
}

export interface RequestMeta {
  requestId: string
  timestamp: string
  quotaMax: number
  quotaRemaining: number
  quotaResetOn: string
}

const canonicalizeParameters = (parameters: Parameters): string => {
  const sp = new URLSearchParams(parameters)
  sp.sort()
  return sp.toString().replace(/\+/g, '%20')
}

const defaultFetch = <T>({ url, method, headers, data }: Request): Promise<[T, RequestMeta]> =>
  axios({ method, url, headers, data }).then((response) => {
    const responseData = parser.parse(response.data)

    return [
      responseData,
      {
        requestId: response.headers['x-mws-request-id'] || responseData.ResponseMetadata.RequestId,
        timestamp: response.headers['x-mws-timestamp'],
        quotaMax: Number(response.headers['x-mws-quota-max']),
        quotaRemaining: Number(response.headers['x-mws-quota-remaining']),
        quotaResetOn: response.headers['x-mws-quota-resetson'],
      },
    ]
  })

export class HttpClient {
  constructor(
    private options: MWSOptions,
    private fetch: <T>(meta: Request) => Promise<[T, RequestMeta]> = defaultFetch,
  ) {}

  request<TResource extends Resource, TRes>(
    method: HttpMethod,
    info: ResourceInfo<TResource>,
  ): Promise<[TRes, RequestMeta]> {
    const marketplaceUri = this.options.marketplace.webServiceUri

    const host = marketplaceUri.replace('https://', '')
    const url = `${marketplaceUri}/${info.resource}/${info.version}`

    const parameters = {
      AWSAccessKeyId: this.options.awsAccessKeyId,
      Action: info.action,
      MWSAuthToken: this.options.mwsAuthToken,
      SellerId: this.options.sellerId,
      SignatureMethod: 'HmacSHA256',
      SignatureVersion: '2',
      Timestamp: new Date().toISOString(),
      Version: info.version,
      ...info.parameters,
    }

    const parametersForSigning = canonicalizeParameters(parameters)
    const queryStringToSign = `${method}\n${host}\n/${info.resource}/${info.version}\n${parametersForSigning}`

    const signature = sign(queryStringToSign, this.options.secretKey)
    const parametersWithSignature = { ...parameters, Signature: signature }

    const headers = {
      'user-agent': '@scaleleap/amazon-mws-api-sdk/1.0.0 (Language=JavaScript)',
    }

    return method === 'GET'
      ? this.fetch({
          url: `${url}?${canonicalizeParameters(parametersWithSignature)}`,
          method,
          headers,
        })
      : this.fetch({
          url,
          method,
          headers,
          data: canonicalizeParameters(parametersWithSignature),
        })
  }
}
